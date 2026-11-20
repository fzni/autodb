# AutoDB Database CLI Tools

Direct database management scripts for AutoDB.
Requires **Node.js 22+**. Run from the project root (`adb/` folder).

---

## 1. Quick Commands (npm scripts)

```bash
# List all vehicles in the database
npm run db:list

# Launch the interactive vehicle creation wizard
npm run db:add
```

---

## 2. CLI Usage Options

### Option A: Interactive Wizard
```bash
node scripts/add-vehicle.mjs
```
Menu options:
1. **Add a new vehicle** — Guided prompts section by section (Basic info → Powertrain → Chassis → Domain specifics).
2. **List all vehicles** — Displays a clean tabular list with slug, make, model, year, domain, HP, and weight.
3. **Add vehicle from JSON file** — Prompts for a path to a JSON file and confirms.
4. **Exit**

---

### Option B: Quick Import from JSON File
Create or edit a JSON file (you can use `scripts/sample-vehicle.json` as a starting template):

```bash
# Interactive confirmation before save:
node scripts/add-vehicle.mjs scripts/sample-vehicle.json

# Auto-confirm and save immediately:
node scripts/add-vehicle.mjs --file scripts/sample-vehicle.json --yes
```

---

### Option C: Direct Inline JSON
```bash
node scripts/add-vehicle.mjs --json '{"make":"BMW","model":"M3","generation":"G80","year":2023,"domain":"Road","sub_category":"Sports Sedan","hero_image":"https://example.com/m3.jpg","summary":"Iconic performance sedan","powertrain":{"hp":503,"drivetrain":"RWD"},"chassis":{"curb_weight_kg":1730}}'
```

---

### Option D: Direct List Table
```bash
node scripts/add-vehicle.mjs --list
```

---

## 3. Vehicle JSON Schema Template

See [`scripts/sample-vehicle.json`](sample-vehicle.json) for a complete example.

```json
{
  "make": "Porsche",
  "model": "911 GT3 RS",
  "generation": "992",
  "year": 2023,
  "domain": "Road",
  "sub_category": "Track-Focused Supercar",
  "hero_image": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80",
  "summary": "Aerodynamic tour-de-force with DRS swan-neck rear wing generating 860 kg of downforce.",
  "powertrain": {
    "engine_type": "4.0L Naturally Aspirated Flat-Six",
    "displacement_l": 4.0,
    "layout": "Rear Longitudinal",
    "aspiration": "Naturally Aspirated",
    "hp": 518,
    "kw": 386,
    "torque_nm": 465,
    "transmission": "7-Speed PDK Dual Clutch",
    "drivetrain": "RWD",
    "fuel_type": "Petrol 98 RON",
    "redline_rpm": 9000
  },
  "chassis": {
    "curb_weight_kg": 1450,
    "chassis_type": "Aluminium-Steel Monocoque with CFRP body panels",
    "length_mm": 4572,
    "width_mm": 1900,
    "height_mm": 1322,
    "wheelbase_mm": 2457,
    "suspension_front": "Double-Wishbone with Teardrop Aerodynamic Profile",
    "suspension_rear": "Multi-Link with Rear-Axle Steering",
    "brakes_front": "408mm PCCB Carbon Ceramic",
    "brakes_rear": "380mm Carbon Ceramic",
    "wheels_tires": "Front: 275/35 R20 | Rear: 335/30 R21 Michelin Cup 2 R"
  },
  "domain_specific": {
    "zero_to_hundred_sec": 3.2,
    "top_speed_kmh": 296,
    "drag_coefficient": 0.39,
    "status": "Production",
    "signature_feature": "DRS Wing with 860kg downforce at 285 km/h"
  }
}
```

**Valid domains:** `Road` | `Commercial` | `Motorsport` | `Concept`

---

## 4. Notes
- All inserts write directly to `data/autodb.db` via Node's native `node:sqlite`.
- Slugs are automatically computed from `make-model-generation`.
- `contributor_handle` defaults to `@admin` and `contributor_fingerprint` to `KEY:ADMIN`.
- The database does NOT require the web server to be running when you add or modify vehicles.
