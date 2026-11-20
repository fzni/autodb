#!/usr/bin/env node
/**
 * AutoDB Vehicle Seeder CLI
 * Requires Node.js 22+ (uses node:sqlite built-in)
 * Run from project root: node scripts/add-vehicle.mjs
 */

import { DatabaseSync } from 'node:sqlite';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Resolve project root ─────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot(startDir) {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return startDir; // filesystem root — fall back
    dir = parent;
  }
}

const PROJECT_ROOT = findProjectRoot(__dirname);
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'autodb.db');

// ── Open / initialise database ───────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

try { db.exec('PRAGMA journal_mode = WAL;'); } catch {}
try { db.exec('PRAGMA synchronous = NORMAL;'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    generation TEXT NOT NULL,
    year INTEGER NOT NULL,
    domain TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    hero_image TEXT NOT NULL,
    summary TEXT NOT NULL,
    powertrain TEXT NOT NULL,
    chassis TEXT NOT NULL,
    domain_specific TEXT NOT NULL,
    contributor_handle TEXT NOT NULL,
    contributor_fingerprint TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    public_key_jwk TEXT NOT NULL,
    key_fingerprint TEXT NOT NULL,
    secret_key TEXT,
    role TEXT NOT NULL DEFAULT 'contributor',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS challenges (
    nonce TEXT PRIMARY KEY,
    user_handle TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    vehicle_slug TEXT NOT NULL,
    voter_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(vehicle_slug, voter_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    vehicle_slug TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// ── Readline interface ───────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

process.on('SIGINT', () => {
  console.log('\n\nAborted. Goodbye.');
  rl.close();
  db.close();
  process.exit(0);
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

async function askRequired(label) {
  let val = '';
  while (!val) {
    val = await ask(`  ${label}: `);
    if (!val) console.log('  ⚠  This field is required.');
  }
  return val;
}

async function askOptional(label) {
  const val = await ask(`  ${label} (optional, press Enter to skip): `);
  return val || null;
}

async function askInt(label, required = true) {
  while (true) {
    const raw = required ? await askRequired(label) : await askOptional(label);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    if (!isNaN(n)) return n;
    console.log('  ⚠  Please enter a valid integer.');
  }
}

async function askFloat(label, required = true) {
  while (true) {
    const raw = required ? await askRequired(label) : await askOptional(label);
    if (raw === null) return null;
    const n = parseFloat(raw);
    if (!isNaN(n)) return n;
    console.log('  ⚠  Please enter a valid number.');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeSlug(make, model, generation) {
  return [make, model, generation]
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function makeId(make, model) {
  return (
    'v-' +
    make.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
    '-' +
    model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
    '-' +
    Date.now()
  );
}

function insertVehicle(v) {
  db.prepare(`
    INSERT INTO vehicles (
      id, slug, make, model, generation, year, domain, sub_category,
      hero_image, summary, powertrain, chassis, domain_specific,
      contributor_handle, contributor_fingerprint, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    v.id, v.slug, v.make, v.model, v.generation, v.year,
    v.domain, v.sub_category, v.hero_image, v.summary,
    JSON.stringify(v.powertrain),
    JSON.stringify(v.chassis),
    JSON.stringify(v.domain_specific),
    v.contributor_handle, v.contributor_fingerprint,
    v.created_at, v.updated_at
  );
}

// ── Option 1: Interactive add ────────────────────────────────────────────────
async function interactiveAdd() {
  console.log('\n── Basic Info ───────────────────────────────────────────────');
  const make       = await askRequired('Make (e.g. Porsche)');
  const model      = await askRequired('Model (e.g. 911 GT3)');
  const generation = await askRequired('Generation (e.g. 992)');
  const year       = await askInt('Year');

  console.log('\n  Domain options:');
  console.log('    1. Road');
  console.log('    2. Commercial');
  console.log('    3. Motorsport');
  console.log('    4. Concept');
  const DOMAINS = ['Road', 'Commercial', 'Motorsport', 'Concept'];
  let domain;
  while (!domain) {
    const choice = await ask('  Domain (1-4): ');
    if (['1','2','3','4'].includes(choice)) {
      domain = DOMAINS[parseInt(choice, 10) - 1];
    } else {
      console.log('  ⚠  Please enter 1, 2, 3, or 4.');
    }
  }

  const sub_category = await askRequired('Sub-category (e.g. High-Performance Saloon)');
  const hero_image   = await askRequired('Hero image URL (e.g. https://example.com/car.jpg)');
  const summary      = await askRequired('Summary (brief description)');

  console.log('\n── Powertrain ───────────────────────────────────────────────');
  const engine_type    = await askRequired('Engine type (e.g. Flat-Six, Inline-Four, Electric)');
  const displacement_l = await askFloat('Displacement (litres, e.g. 4.0)', false) ;
  const layout         = await askRequired('Layout (e.g. Mid-Engine RR, Front-Engine FR)');
  const aspiration     = await askRequired('Aspiration (e.g. Naturally Aspirated, Twin-Turbocharged)');
  const hp             = await askInt('Horsepower (hp)');
  const kw             = await askInt('Power (kW)');
  const torque_nm      = await askInt('Torque (Nm)');
  const transmission   = await askRequired('Transmission (e.g. 7-speed PDK)');
  const drivetrain     = await askRequired('Drivetrain (e.g. RWD, AWD, FWD)');
  const fuel_type      = await askRequired('Fuel type (e.g. Petrol, Diesel, Electric)');
  const redline_rpm    = await askInt('Redline RPM', false);
  const battery_kwh    = await askFloat('Battery capacity (kWh)', false);
  const motors         = await askInt('Number of motors (EVs)', false);

  console.log('\n── Chassis ──────────────────────────────────────────────────');
  const curb_weight_kg    = await askInt('Curb weight (kg)');
  const length_mm         = await askInt('Length (mm)', false);
  const width_mm          = await askInt('Width (mm)', false);
  const height_mm         = await askInt('Height (mm)', false);
  const wheelbase_mm      = await askInt('Wheelbase (mm)', false);
  const chassis_type      = await askRequired('Chassis type (e.g. Monocoque Carbon Fibre, Steel Unibody)');
  const suspension_front  = await askOptional('Front suspension');
  const suspension_rear   = await askOptional('Rear suspension');
  const brakes_front      = await askOptional('Front brakes');
  const brakes_rear       = await askOptional('Rear brakes');
  const wheels_tires      = await askOptional('Wheels / tyres');

  console.log(`\n── Domain-specific (${domain}) ────────────────────────────────`);
  const domain_specific = {};

  if (domain === 'Road' || domain === 'Concept') {
    domain_specific.zero_to_hundred_sec = await askFloat('0–100 km/h (sec)', false);
    domain_specific.top_speed_kmh       = await askInt('Top speed (km/h)', false);
    domain_specific.drag_coefficient    = await askFloat('Drag coefficient (Cd)', false);
    domain_specific.design_lead        = await askOptional('Design lead');
    domain_specific.status             = await askRequired('Status (e.g. Production, Concept)');
    domain_specific.signature_feature  = await askOptional('Signature feature');
  } else if (domain === 'Commercial') {
    domain_specific.payload_capacity_kg    = await askInt('Payload capacity (kg)', false);
    domain_specific.gvw_kg                 = await askInt('GVW (kg)', false);
    domain_specific.towing_capacity_kg     = await askInt('Towing capacity (kg)', false);
    domain_specific.axle_configuration    = await askOptional('Axle configuration (e.g. 6×4)');
    domain_specific.cargo_volume_m3        = await askFloat('Cargo volume (m³)', false);
    domain_specific.operational_duty_cycle = await askOptional('Operational duty cycle');
  } else if (domain === 'Motorsport') {
    domain_specific.aero_downforce_kg      = await askInt('Aero downforce (kg)', false);
    domain_specific.ballast_kg             = await askInt('Ballast (kg)', false);
    domain_specific.telemetry_class        = await askOptional('Telemetry class');
    domain_specific.fuel_capacity_l        = await askFloat('Fuel capacity (litres)', false);
    domain_specific.regulation_category    = await askOptional('Regulation category (e.g. FIA GT3)');
    domain_specific.ers_hybrid_power_kw    = await askFloat('ERS/hybrid power (kW)', false);
  }

  // Strip null values from domain_specific
  for (const k of Object.keys(domain_specific)) {
    if (domain_specific[k] === null) delete domain_specific[k];
  }

  const now  = new Date().toISOString();
  const slug = makeSlug(make, model, generation);
  const id   = makeId(make, model);

  const vehicle = {
    id,
    slug,
    make,
    model,
    generation,
    year,
    domain,
    sub_category,
    hero_image,
    summary,
    powertrain: {
      engine_type,
      ...(displacement_l !== null ? { displacement_l } : {}),
      layout,
      aspiration,
      hp,
      kw,
      torque_nm,
      transmission,
      drivetrain,
      fuel_type,
      ...(redline_rpm !== null ? { redline_rpm } : {}),
      ...(battery_kwh !== null ? { battery_kwh } : {}),
      ...(motors !== null ? { motors } : {}),
    },
    chassis: {
      curb_weight_kg,
      ...(length_mm !== null ? { length_mm } : {}),
      ...(width_mm !== null ? { width_mm } : {}),
      ...(height_mm !== null ? { height_mm } : {}),
      ...(wheelbase_mm !== null ? { wheelbase_mm } : {}),
      chassis_type,
      ...(suspension_front ? { suspension_front } : {}),
      ...(suspension_rear ? { suspension_rear } : {}),
      ...(brakes_front ? { brakes_front } : {}),
      ...(brakes_rear ? { brakes_rear } : {}),
      ...(wheels_tires ? { wheels_tires } : {}),
    },
    domain_specific,
    contributor_handle: '@admin',
    contributor_fingerprint: 'KEY:ADMIN',
    created_at: now,
    updated_at: now,
  };

  console.log('\n── Summary ──────────────────────────────────────────────────');
  console.log(`  ID:         ${vehicle.id}`);
  console.log(`  Slug:       ${vehicle.slug}`);
  console.log(`  Make:       ${vehicle.make}`);
  console.log(`  Model:      ${vehicle.model}`);
  console.log(`  Generation: ${vehicle.generation}`);
  console.log(`  Year:       ${vehicle.year}`);
  console.log(`  Domain:     ${vehicle.domain}`);
  console.log(`  HP:         ${vehicle.powertrain.hp}`);
  console.log(`  Weight:     ${vehicle.chassis.curb_weight_kg} kg`);
  console.log('─────────────────────────────────────────────────────────────');

  const confirm = await ask('\nSave? (y/n): ');
  if (confirm.toLowerCase() === 'y') {
    try {
      insertVehicle(vehicle);
      console.log(`\n✓ Vehicle saved: ${vehicle.slug}\n`);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        console.error(`\n✗ A vehicle with slug "${vehicle.slug}" already exists.\n`);
      } else {
        console.error('\n✗ Error saving vehicle:', err.message, '\n');
      }
    }
  } else {
    console.log('\nDiscarded.\n');
  }
}

// ── Option 2: List vehicles ──────────────────────────────────────────────────
function listVehicles() {
  const rows = db.prepare('SELECT * FROM vehicles ORDER BY year DESC').all();
  if (rows.length === 0) {
    console.log('\n  No vehicles in the database.\n');
    return;
  }

  const COL = { slug: 32, make: 14, model: 18, year: 6, domain: 12, hp: 6, weight: 10 };
  const pad = (s, n) => String(s ?? '—').padEnd(n).substring(0, n);

  console.log('\n' + [
    pad('Slug', COL.slug),
    pad('Make', COL.make),
    pad('Model', COL.model),
    pad('Year', COL.year),
    pad('Domain', COL.domain),
    pad('HP', COL.hp),
    pad('Weight(kg)', COL.weight),
  ].join(' | '));
  console.log('─'.repeat(COL.slug + COL.make + COL.model + COL.year + COL.domain + COL.hp + COL.weight + 18));

  for (const row of rows) {
    let pt = {};
    let ch = {};
    try { pt = JSON.parse(row.powertrain); } catch {}
    try { ch = JSON.parse(row.chassis); } catch {}
    console.log([
      pad(row.slug, COL.slug),
      pad(row.make, COL.make),
      pad(row.model, COL.model),
      pad(row.year, COL.year),
      pad(row.domain, COL.domain),
      pad(pt.hp ?? '—', COL.hp),
      pad(ch.curb_weight_kg ?? '—', COL.weight),
    ].join(' | '));
  }
  console.log(`\n  Total: ${rows.length} vehicle(s)\n`);
}

// ── Option 3: Add from JSON file ─────────────────────────────────────────────
async function addFromJson(argPath) {
  let filePath = argPath;
  if (!filePath) {
    filePath = await ask('  Path to JSON file: ');
    filePath = filePath.trim();
  }

  if (!filePath) { console.log('  No path provided.\n'); return; }

  // Resolve relative to cwd
  if (!path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(filePath)) {
    console.error(`  ✗ File not found: ${filePath}\n`);
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`  ✗ Invalid JSON: ${err.message}\n`);
    return;
  }

  // Validate required top-level fields
  const required = ['make', 'model', 'generation', 'year', 'domain', 'sub_category', 'hero_image', 'summary'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      console.error(`  ✗ Missing required field: "${field}"\n`);
      return;
    }
  }

  const VALID_DOMAINS = ['Road', 'Commercial', 'Motorsport', 'Concept'];
  if (!VALID_DOMAINS.includes(data.domain)) {
    console.error(`  ✗ Invalid domain "${data.domain}". Must be one of: ${VALID_DOMAINS.join(', ')}\n`);
    return;
  }

  const now  = new Date().toISOString();
  const slug = data.slug || makeSlug(data.make, data.model, data.generation);
  const id   = data.id   || makeId(data.make, data.model);

  const vehicle = {
    id,
    slug,
    make:         data.make,
    model:        data.model,
    generation:   data.generation,
    year:         Number(data.year),
    domain:       data.domain,
    sub_category: data.sub_category,
    hero_image:   data.hero_image,
    summary:      data.summary,
    powertrain:   data.powertrain   || {},
    chassis:      data.chassis      || {},
    domain_specific: data.domain_specific || {},
    contributor_handle:      data.contributor_handle      || '@admin',
    contributor_fingerprint: data.contributor_fingerprint || 'KEY:ADMIN',
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
  };

  console.log(`\n  Slug: ${vehicle.slug}`);
  console.log(`  ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.generation} [${vehicle.domain}]`);

  const autoConfirm = process.argv.includes('--yes') || process.argv.includes('-y');
  const confirm = autoConfirm ? 'y' : await ask('  Save? (y/n): ');
  if (confirm.toLowerCase() === 'y') {
    try {
      insertVehicle(vehicle);
      console.log(`\n✓ Vehicle saved: ${vehicle.slug}\n`);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        console.error(`\n✗ A vehicle with slug "${vehicle.slug}" already exists.\n`);
      } else {
        console.error('\n✗ Error saving vehicle:', err.message, '\n');
      }
    }
  } else {
    console.log('  Discarded.\n');
  }
}

// ── Main menu & CLI flags ───────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  // Direct CLI flag: --list or -l
  if (args.includes('--list') || args.includes('-l')) {
    listVehicles();
    rl.close();
    db.close();
    process.exit(0);
  }

  // Direct CLI flag: --file <path> or passing a file path directly
  const fileFlagIdx = args.indexOf('--file') !== -1 ? args.indexOf('--file') : args.indexOf('-f');
  let directFilePath = null;
  if (fileFlagIdx !== -1 && args[fileFlagIdx + 1]) {
    directFilePath = args[fileFlagIdx + 1];
  } else if (args[0] && !args[0].startsWith('-') && (args[0].endsWith('.json') || fs.existsSync(args[0]))) {
    directFilePath = args[0];
  }

  if (directFilePath) {
    console.log(`\nImporting vehicle from: ${directFilePath}`);
    await addFromJson(directFilePath);
    rl.close();
    db.close();
    process.exit(0);
  }

  // Direct CLI flag: --json '<raw-json-string>'
  const jsonFlagIdx = args.indexOf('--json');
  if (jsonFlagIdx !== -1 && args[jsonFlagIdx + 1]) {
    try {
      const data = JSON.parse(args[jsonFlagIdx + 1]);
      const vehicle = buildVehicleObject(data);
      insertVehicle(vehicle);
      console.log(`\n✓ Vehicle inserted directly: ${vehicle.slug} (${vehicle.year} ${vehicle.make} ${vehicle.model})\n`);
    } catch (e) {
      console.error('\n✗ Error parsing or inserting JSON:', e.message, '\n');
    }
    rl.close();
    db.close();
    process.exit(0);
  }

  // Interactive menu
  console.log('\nAutoDB Vehicle Seeder');
  console.log('=====================');
  console.log(`Database: ${DB_PATH}\n`);

  while (true) {
    console.log('1. Add a new vehicle (interactive prompts)');
    console.log('2. List all vehicles');
    console.log('3. Add vehicle from JSON file');
    console.log('4. Exit');

    const choice = await ask('\nChoice: ');

    switch (choice) {
      case '1':
        await interactiveAdd();
        break;
      case '2':
        listVehicles();
        break;
      case '3':
        await addFromJson(null);
        break;
      case '4':
        console.log('\nGoodbye.\n');
        rl.close();
        db.close();
        process.exit(0);
      default:
        console.log('  Please enter 1, 2, 3, or 4.\n');
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
