export type Domain = 'Road' | 'Commercial' | 'Motorsport' | 'Concept';

export type UnitSystem = 'metric' | 'imperial';

export interface PowertrainSpec {
  engine_type: string;
  displacement_l?: number;
  layout: string; // e.g. "Rear-Engine", "Front Mid-Engine", "All-Wheel Electric"
  aspiration: string; // "Naturally Aspirated", "Twin-Turbocharged", "Quad-Turbocharged", "Electric", "Hybrid Turbo"
  hp: number;
  kw: number;
  torque_nm: number;
  transmission: string;
  drivetrain: string; // "RWD", "AWD", "FWD", "4WD", "6x4", "6x6"
  fuel_type: string; // "Petrol 98 RON", "Diesel", "Electric", "E10 Fuel", "E85 Biofuel"
  redline_rpm?: number;
  battery_kwh?: number;
  motors?: number;
}

export interface ChassisSpec {
  curb_weight_kg: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  wheelbase_mm?: number;
  chassis_type: string; // e.g. "Carbon Monocoque", "Ladder Frame Steel", "Steel/Aluminium Unibody"
  suspension_front?: string;
  suspension_rear?: string;
  brakes_front?: string;
  brakes_rear?: string;
  wheels_tires?: string;
}

export interface DomainSpecificSpec {
  // Road & Concept
  zero_to_hundred_sec?: number;
  top_speed_kmh?: number;
  drag_coefficient?: number;
  design_lead?: string;
  status?: string; // "Production", "Limited Run", "One-off Concept", "Retired Champion"
  signature_feature?: string;

  // Commercial / Industrial
  payload_capacity_kg?: number;
  gvw_kg?: number; // Gross Vehicle Weight
  towing_capacity_kg?: number;
  axle_configuration?: string;
  cargo_volume_m3?: number;
  operational_duty_cycle?: string;

  // Motorsport
  aero_downforce_kg?: number;
  ballast_kg?: number;
  telemetry_class?: string;
  fuel_capacity_l?: number;
  regulation_category?: string;
  ers_hybrid_power_kw?: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  generation: string;
  year: number;
  domain: Domain;
  sub_category: string;
  hero_image: string;
  summary: string;
  powertrain: PowertrainSpec;
  chassis: ChassisSpec;
  domain_specific: DomainSpecificSpec;
  contributor_handle: string;
  contributor_fingerprint: string;
  contributors?: string[];
  last_edited_by?: string;
  source_url?: string;
  downforce_kg?: number;
  downforce_speed_kmh?: number;
  drag_coefficient?: number;
  frontal_area_m2?: number;
  votes_count?: number;
  has_voted?: boolean;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  vehicle_slug: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface User {
  id: string;
  handle: string;
  public_key_jwk?: string; // JSON string
  key_fingerprint?: string;
  secret_key?: string;
  role: 'admin' | 'contributor';
  email?: string;
  email_verified?: number; // 0 = unverified, 1 = verified
  email_verify_token?: string;
  email_verify_expires?: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
  created_at: string;
}

export interface Challenge {
  nonce: string;
  user_handle: string;
  expires_at: number;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: number;
  created_at: string;
  updated_at: string;
  items_count?: number;
  vehicles?: Vehicle[];
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  vehicle_slug: string;
  added_at: string;
  vehicle?: Vehicle;
}

export interface SpecRevision {
  id: string;
  vehicle_slug: string;
  proposer_handle: string;
  proposer_fingerprint: string;
  changes_json: string;
  change_summary: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_handle?: string;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  vehicle_name?: string;
  vehicle_hero_image?: string;
}

export interface BrandSummary {
  make: string;
  count: number;
  domains: Domain[];
  hero_image: string;
}
