import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { Vehicle, User, Session, Challenge, Comment } from './types';
import { STARTER_VEHICLES } from './seed-data';
import { DEMO_ADMIN_KEY } from './demo-admin';

let dbInstance: DatabaseSync | null = null;

export const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'autodb-secret-key-2025';

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'autodb.db');
  const db = new DatabaseSync(dbPath);
  dbInstance = db;

  // Enable WAL mode for high concurrency
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  } catch (err) {
    // Ignore pragma error if in-memory
  }

  // Create tables
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

  // Migrations
  try {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'contributor';");
  } catch (e) {}

  try {
    db.exec("ALTER TABLE users ADD COLUMN secret_key TEXT;");
  } catch (e) {}

  // Auto-seed admin user if @admin does not exist
  try {
    const adminCheck = db.prepare('SELECT id FROM users WHERE LOWER(handle) = ?').get('@admin') as any;
    if (!adminCheck) {
      db.prepare(`
        INSERT INTO users (id, handle, public_key_jwk, key_fingerprint, secret_key, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr_admin_master',
        '@admin',
        JSON.stringify(DEMO_ADMIN_KEY.public_key),
        DEMO_ADMIN_KEY.key_fingerprint,
        ADMIN_SECRET_KEY,
        'admin',
        new Date().toISOString()
      );
    } else {
      // Ensure admin's secret key is synchronized
      db.prepare('UPDATE users SET secret_key = ? WHERE LOWER(handle) = ?').run(ADMIN_SECRET_KEY, '@admin');
    }
  } catch (e) {
    console.error('Error seeding admin user:', e);
  }

  // Pre-seed a sample community user (@ApexHunter) with known secret key
  try {
    const userCheck = db.prepare('SELECT id FROM users WHERE LOWER(handle) = ?').get('@apexhunter') as any;
    if (!userCheck) {
      db.prepare(`
        INSERT INTO users (id, handle, public_key_jwk, key_fingerprint, secret_key, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr_apexhunter',
        '@ApexHunter',
        '',
        'KEY:APEX4488',
        'key-apexhunter-4488',
        'contributor',
        new Date().toISOString()
      );
    }
  } catch (e) {
    console.error('Error seeding sample community user:', e);
  }

  // Auto-seed if vehicles table is empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM vehicles');
  const row = countStmt.get() as { count: number } | undefined;
  if (!row || row.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO vehicles (
        id, slug, make, model, generation, year, domain, sub_category,
        hero_image, summary, powertrain, chassis, domain_specific,
        contributor_handle, contributor_fingerprint, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const v of STARTER_VEHICLES) {
      insertStmt.run(
        v.id,
        v.slug,
        v.make,
        v.model,
        v.generation,
        v.year,
        v.domain,
        v.sub_category,
        v.hero_image,
        v.summary,
        JSON.stringify(v.powertrain),
        JSON.stringify(v.chassis),
        JSON.stringify(v.domain_specific),
        v.contributor_handle,
        v.contributor_fingerprint,
        v.created_at,
        v.updated_at
      );
    }

    // Auto-seed starter community comments
    try {
      const sampleComments = [
        {
          slug: 'porsche-911-gt3-992',
          author: '@ApexHunter',
          text: 'The 9,000 RPM naturally aspirated flat-six with motorsport double-wishbone front suspension is pure driving nirvana.',
        },
        {
          slug: 'porsche-911-gt3-992',
          author: '@TracksideObserver',
          text: 'Swan-neck rear wing downforce is insane on Nürburgring corners. Unmatched throttle response.',
        },
        {
          slug: 'rimac-nevera',
          author: '@EV_Torque',
          text: '1,914 HP and 2,360 Nm torque across all four independent motors. 0-100 in 1.81s is mind-bending.',
        },
        {
          slug: 'red-bull-rb19',
          author: '@AeroNewey',
          text: 'The underfloor venturi tunnels and extreme ground-effect balance made this the most dominant F1 car in history.',
        },
        {
          slug: 'scania-r770-v8',
          author: '@HeavyHaulerEU',
          text: 'King of the highway. 3,700 Nm of torque pulls massive gross train weights through mountains effortlessly.',
        },
        {
          slug: 'mercedes-benz-unimog-u5023',
          author: '@ExpeditionPro',
          text: 'Portal axles and extreme chassis flex. Nothing on Earth can traverse terrain quite like a Unimog.',
        },
        {
          slug: 'mazda-furai',
          author: '@RotaryHeart',
          text: 'Tri-rotor 20B racing engine singing at 10,000 RPM with Nagare flow design. An unforgettable concept car.',
        },
      ];

      for (const sc of sampleComments) {
        addComment(sc.slug, sc.author, sc.text);
      }
    } catch (seedErr) {
      console.warn('Notice: starter comments already present or skipped:', seedErr);
    }
  }

  return db;
}

// Vehicle Helpers
export function parseVehicleRow(row: any): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    make: row.make,
    model: row.model,
    generation: row.generation,
    year: Number(row.year),
    domain: row.domain,
    sub_category: row.sub_category,
    hero_image: row.hero_image,
    summary: row.summary,
    powertrain: typeof row.powertrain === 'string' ? JSON.parse(row.powertrain) : row.powertrain,
    chassis: typeof row.chassis === 'string' ? JSON.parse(row.chassis) : row.chassis,
    domain_specific: typeof row.domain_specific === 'string' ? JSON.parse(row.domain_specific) : row.domain_specific,
    contributor_handle: row.contributor_handle,
    contributor_fingerprint: row.contributor_fingerprint,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getAllVehicles(
  filters?: {
    domain?: string;
    drivetrain?: string;
    query?: string;
    sort?: string;
  },
  currentUserId?: string
): Vehicle[] {
  const db = getDb();
  let sql = 'SELECT * FROM vehicles WHERE 1=1';
  const params: any[] = [];

  if (filters?.domain && filters.domain !== 'All') {
    sql += ' AND domain = ?';
    params.push(filters.domain);
  }

  if (filters?.query && filters.query.trim().length > 0) {
    const q = `%${filters.query.trim().toLowerCase()}%`;
    sql += ' AND (LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(generation) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(sub_category) LIKE ?)';
    params.push(q, q, q, q, q);
  }

  const rows = db.prepare(sql).all(...params) as any[];
  let vehicles = rows.map(parseVehicleRow);

  // Attach vote and comment counts
  const votesMap = getAllVotesMap();
  const commentsMap = getAllCommentsCountMap();
  const votedSlugs = currentUserId ? getUserVotedSlugs(currentUserId) : new Set<string>();

  for (const v of vehicles) {
    v.votes_count = votesMap[v.slug] || 0;
    v.comments_count = commentsMap[v.slug] || 0;
    if (currentUserId) {
      v.has_voted = votedSlugs.has(v.slug);
    }
  }

  // Filter by drivetrain if requested
  if (filters?.drivetrain && filters.drivetrain !== 'All') {
    vehicles = vehicles.filter(
      (v) => v.powertrain?.drivetrain?.toUpperCase() === filters.drivetrain?.toUpperCase()
    );
  }

  // Sorting
  if (filters?.sort) {
    switch (filters.sort) {
      case 'most_voted':
        vehicles.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
        break;
      case 'highest_hp':
        vehicles.sort((a, b) => (b.powertrain?.hp || 0) - (a.powertrain?.hp || 0));
        break;
      case 'lightest':
        vehicles.sort((a, b) => {
          const wA = a.chassis?.curb_weight_kg || 999999;
          const wB = b.chassis?.curb_weight_kg || 999999;
          return wA - wB;
        });
        break;
      case 'best_hp_ton':
        vehicles.sort((a, b) => {
          const rA = a.chassis?.curb_weight_kg ? (a.powertrain?.hp || 0) / (a.chassis.curb_weight_kg / 1000) : 0;
          const rB = b.chassis?.curb_weight_kg ? (b.powertrain?.hp || 0) / (b.chassis.curb_weight_kg / 1000) : 0;
          return rB - rA;
        });
        break;
      case 'newest':
      default:
        vehicles.sort((a, b) => b.year - a.year);
        break;
    }
  } else {
    vehicles.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
  }

  return vehicles;
}

export function getVehicleBySlug(slug: string, currentUserId?: string): Vehicle | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM vehicles WHERE slug = ?').get(slug) as any;
  if (!row) return null;
  const vehicle = parseVehicleRow(row);
  vehicle.votes_count = getVehicleVotes(slug);
  vehicle.comments_count = getVehicleComments(slug).length;
  if (currentUserId) {
    vehicle.has_voted = hasUserVoted(slug, currentUserId);
  }
  return vehicle;
}

export function getVehicleById(id: string): Vehicle | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as any;
  if (!row) return null;
  return parseVehicleRow(row);
}

export function createVehicle(v: Vehicle): Vehicle {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO vehicles (
      id, slug, make, model, generation, year, domain, sub_category,
      hero_image, summary, powertrain, chassis, domain_specific,
      contributor_handle, contributor_fingerprint, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    v.id,
    v.slug,
    v.make,
    v.model,
    v.generation,
    v.year,
    v.domain,
    v.sub_category,
    v.hero_image,
    v.summary,
    JSON.stringify(v.powertrain),
    JSON.stringify(v.chassis),
    JSON.stringify(v.domain_specific),
    v.contributor_handle,
    v.contributor_fingerprint,
    v.created_at,
    v.updated_at
  );

  return v;
}

export function updateVehicle(slug: string, v: Partial<Vehicle>): Vehicle | null {
  const existing = getVehicleBySlug(slug);
  if (!existing) return null;

  const updated: Vehicle = {
    ...existing,
    ...v,
    updated_at: new Date().toISOString(),
  };

  const db = getDb();
  const stmt = db.prepare(`
    UPDATE vehicles SET
      make = ?, model = ?, generation = ?, year = ?, domain = ?, sub_category = ?,
      hero_image = ?, summary = ?, powertrain = ?, chassis = ?, domain_specific = ?,
      updated_at = ?
    WHERE slug = ?
  `);

  stmt.run(
    updated.make,
    updated.model,
    updated.generation,
    updated.year,
    updated.domain,
    updated.sub_category,
    updated.hero_image,
    updated.summary,
    JSON.stringify(updated.powertrain),
    JSON.stringify(updated.chassis),
    JSON.stringify(updated.domain_specific),
    updated.updated_at,
    slug
  );

  return updated;
}

export function deleteVehicle(slug: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM vehicles WHERE slug = ?').run(slug);
  db.prepare('DELETE FROM votes WHERE vehicle_slug = ?').run(slug);
  db.prepare('DELETE FROM comments WHERE vehicle_slug = ?').run(slug);
  return true;
}

// Votes
export function getVehicleVotes(slug: string): number {
  const db = getDb();
  const res = db.prepare('SELECT COUNT(*) as count FROM votes WHERE vehicle_slug = ?').get(slug) as any;
  return res?.count || 0;
}

export function hasUserVoted(slug: string, userId: string): boolean {
  if (!userId) return false;
  const db = getDb();
  const res = db.prepare('SELECT id FROM votes WHERE vehicle_slug = ? AND voter_id = ?').get(slug, userId) as any;
  return !!res;
}

export function getUserVotedSlugs(userId: string): Set<string> {
  if (!userId) return new Set();
  const db = getDb();
  try {
    const rows = db.prepare('SELECT vehicle_slug FROM votes WHERE voter_id = ?').all(userId) as any[];
    return new Set(rows.map((r) => r.vehicle_slug));
  } catch {
    return new Set();
  }
}

export function toggleVote(slug: string, userId: string): { voted: boolean; count: number } {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM votes WHERE vehicle_slug = ? AND voter_id = ?').get(slug, userId) as any;
  if (existing) {
    db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
    const count = getVehicleVotes(slug);
    return { voted: false, count };
  } else {
    const id = 'vote_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.prepare('INSERT INTO votes (id, vehicle_slug, voter_id, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      slug,
      userId,
      new Date().toISOString()
    );
    const count = getVehicleVotes(slug);
    return { voted: true, count };
  }
}

export function getAllVotesMap(): Record<string, number> {
  const db = getDb();
  try {
    const rows = db.prepare('SELECT vehicle_slug, COUNT(*) as count FROM votes GROUP BY vehicle_slug').all() as any[];
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.vehicle_slug] = r.count;
    }
    return map;
  } catch (e) {
    return {};
  }
}

// Comments
export function getVehicleComments(slug: string): Comment[] {
  const db = getDb();
  try {
    const rows = db.prepare('SELECT * FROM comments WHERE vehicle_slug = ? ORDER BY created_at DESC').all(slug) as any[];
    return rows.map((r) => ({
      id: r.id,
      vehicle_slug: r.vehicle_slug,
      author_name: r.author_name,
      content: r.content,
      created_at: r.created_at,
    }));
  } catch (e) {
    return [];
  }
}

export function addComment(slug: string, authorName: string, content: string): Comment {
  const db = getDb();
  const id = 'cmt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const created_at = new Date().toISOString();
  const cleanAuthor = authorName?.trim() || 'AutoDB Enthusiast';
  const cleanContent = content.trim();

  db.prepare('INSERT INTO comments (id, vehicle_slug, author_name, content, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id,
    slug,
    cleanAuthor,
    cleanContent,
    created_at
  );

  return {
    id,
    vehicle_slug: slug,
    author_name: cleanAuthor,
    content: cleanContent,
    created_at,
  };
}

export function deleteComment(commentId: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  return true;
}

export function getAllCommentsCountMap(): Record<string, number> {
  const db = getDb();
  try {
    const rows = db.prepare('SELECT vehicle_slug, COUNT(*) as count FROM comments GROUP BY vehicle_slug').all() as any[];
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.vehicle_slug] = r.count;
    }
    return map;
  } catch (e) {
    return {};
  }
}

// User & Auth DB Helpers
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.handle.toLowerCase() === '@admin';
}

export function verifyAdminSecret(secretKey: string): boolean {
  if (!secretKey) return false;
  return secretKey.trim() === ADMIN_SECRET_KEY.trim();
}

export function getOrCreateAdminUser(): User {
  const db = getDb();
  let admin = db.prepare('SELECT * FROM users WHERE LOWER(handle) = ?').get('@admin') as any;
  if (!admin) {
    const newAdmin: User = {
      id: 'usr_admin_master',
      handle: '@admin',
      public_key_jwk: JSON.stringify(DEMO_ADMIN_KEY.public_key),
      key_fingerprint: DEMO_ADMIN_KEY.key_fingerprint,
      secret_key: ADMIN_SECRET_KEY,
      role: 'admin',
      created_at: new Date().toISOString(),
    };
    createUser(newAdmin);
    return newAdmin;
  }
  return {
    ...admin,
    secret_key: admin.secret_key || ADMIN_SECRET_KEY,
    role: 'admin',
  };
}

export function getUserBySecretKey(secretKey: string): User | null {
  if (!secretKey) return null;
  const cleanKey = secretKey.trim();

  // Check admin key
  if (cleanKey === ADMIN_SECRET_KEY.trim()) {
    return getOrCreateAdminUser();
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE secret_key = ?').get(cleanKey) as any;
  if (!row) return null;

  return {
    id: row.id,
    handle: row.handle,
    secret_key: row.secret_key,
    role: row.role || (row.handle.toLowerCase() === '@admin' ? 'admin' : 'contributor'),
    created_at: row.created_at,
  } as User;
}

export function registerUser(handle: string): { user: User; secretKey: string } {
  const db = getDb();
  let cleanHandle = handle.trim();
  if (!cleanHandle.startsWith('@')) {
    cleanHandle = `@${cleanHandle}`;
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(handle) = LOWER(?)').get(cleanHandle) as any;
  if (existing) {
    throw new Error(`Handle ${cleanHandle} is already registered. Please choose another handle or log in with your existing Secret Key.`);
  }

  const id = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const randPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const cleanName = cleanHandle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
  const secretKey = `autodb-${cleanName}-${randPart1}-${randPart2}`;

  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, handle, public_key_jwk, key_fingerprint, secret_key, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    cleanHandle,
    '',
    `KEY:${randPart1}`,
    secretKey,
    'contributor',
    created_at
  );

  const user: User = {
    id,
    handle: cleanHandle,
    secret_key: secretKey,
    role: 'contributor',
    created_at,
  };

  return { user, secretKey };
}

export function getUserByHandle(handle: string): User | null {
  const db = getDb();
  const normalized = handle.startsWith('@') ? handle : `@${handle}`;
  const row = db.prepare('SELECT * FROM users WHERE LOWER(handle) = LOWER(?)').get(normalized) as any;
  if (!row) return null;
  return {
    ...row,
    role: row.role || (row.handle.toLowerCase() === '@admin' ? 'admin' : 'contributor'),
  } as User;
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    ...row,
    role: row.role || (row.handle.toLowerCase() === '@admin' ? 'admin' : 'contributor'),
  } as User;
}

export function createUser(user: User): User {
  const db = getDb();
  const role = user.role || (user.handle.toLowerCase() === '@admin' ? 'admin' : 'contributor');
  const stmt = db.prepare(`
    INSERT INTO users (id, handle, public_key_jwk, key_fingerprint, secret_key, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(user.id, user.handle, user.public_key_jwk || '', user.key_fingerprint || '', user.secret_key || '', role, user.created_at);
  return { ...user, role };
}

export function createChallenge(userHandle: string): string {
  const db = getDb();
  const now = Date.now();
  db.prepare('DELETE FROM challenges WHERE expires_at < ?').run(now);

  const nonce = 'autodb_challenge_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes

  db.prepare('INSERT INTO challenges (nonce, user_handle, expires_at) VALUES (?, ?, ?)').run(
    nonce,
    userHandle,
    expiresAt
  );

  return nonce;
}

export function getChallenge(nonce: string): Challenge | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM challenges WHERE nonce = ?').get(nonce) as any;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM challenges WHERE nonce = ?').run(nonce);
    return null;
  }
  return row as Challenge;
}

export function deleteChallenge(nonce: string): void {
  const db = getDb();
  db.prepare('DELETE FROM challenges WHERE nonce = ?').run(nonce);
}

export function createSession(userId: string): string {
  const db = getDb();
  const now = Date.now();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);

  const token = 'autodb_sess_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days
  const createdAt = new Date().toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    expiresAt,
    createdAt
  );

  return token;
}

export function getSession(token: string): { session: Session; user: User } | null {
  const db = getDb();
  const now = Date.now();
  const row = db.prepare(`
    SELECT s.id as session_id, s.user_id, s.expires_at, s.created_at as session_created_at,
           u.id as u_id, u.handle, u.public_key_jwk, u.key_fingerprint, u.secret_key, u.role, u.created_at as user_created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).get(token, now) as any;

  if (!row) return null;

  return {
    session: {
      id: row.session_id,
      user_id: row.user_id,
      expires_at: row.expires_at,
      created_at: row.session_created_at,
    },
    user: {
      id: row.u_id,
      handle: row.handle,
      public_key_jwk: row.public_key_jwk,
      key_fingerprint: row.key_fingerprint,
      secret_key: row.secret_key,
      role: row.role || (row.handle.toLowerCase() === '@admin' ? 'admin' : 'contributor'),
      created_at: row.user_created_at,
    },
  };
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}
