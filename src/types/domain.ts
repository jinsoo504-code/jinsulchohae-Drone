export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "issue"
  | "cancelled";

export type Farmer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  memo: string | null;
  created_at: string;
};

export type Field = {
  id: string;
  farmer_id: string;
  field_name: string;
  address: string | null;
  center_lat: number;
  center_lng: number;
  polygon_geojson: GeoJsonPolygon;
  area_size: number | null;
  crop_name: string | null;
  memo: string | null;
  created_at: string;
};

export type SprayTeam = {
  id: string;
  team_name: string;
  manager_name: string | null;
  phone: string | null;
  created_at: string;
};

export type SprayJob = {
  id: string;
  field_id: string;
  farmer_id: string;
  assigned_team_id: string | null;
  scheduled_date: string | null;
  status: JobStatus;
  started_at: string | null;
  completed_at: string | null;
  memo: string | null;
  created_at: string;
};

export type SprayPhoto = {
  id: string;
  job_id: string;
  photo_url: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type JobStatusLog = {
  id: string;
  job_id: string;
  old_status: JobStatus | null;
  new_status: JobStatus;
  changed_by: string | null;
  changed_at: string;
};

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type FieldWithRelations = {
  field: Field;
  farmer: Farmer | null;
  job: SprayJob | null;
  team: SprayTeam | null;
  photos: SprayPhoto[];
};
