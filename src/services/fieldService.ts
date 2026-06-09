import { supabase } from "@/src/lib/supabase";
import { Field, FieldWithRelations, GeoJsonPolygon, JobStatus } from "@/src/types/domain";

export async function fetchFields(): Promise<FieldWithRelations[]> {
  const { data, error } = await supabase
    .from("fields")
    .select(
      `
        *,
        farmer:farmers(*),
        jobs:spray_jobs(*, team:spray_teams(*)),
        photos:spray_photos(*)
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    field: row as Field,
    farmer: row.farmer ?? null,
    job: row.jobs?.[0]
      ? {
          ...row.jobs[0]
        }
      : null,
    team: row.jobs?.[0]?.team ?? null,
    photos: row.photos ?? []
  }));
}

export async function createField(input: {
  farmer_id: string;
  field_name: string;
  address?: string;
  center_lat: number;
  center_lng: number;
  polygon_geojson: GeoJsonPolygon;
  area_size?: number;
  crop_name?: string;
  memo?: string;
}) {
  return supabase.from("fields").insert(input).select("*").single();
}

export async function createSprayJob(input: {
  field_id: string;
  farmer_id: string;
  assigned_team_id?: string | null;
  scheduled_date?: string | null;
  memo?: string | null;
}) {
  return supabase
    .from("spray_jobs")
    .insert({
      ...input,
      assigned_team_id: input.assigned_team_id ?? null,
      scheduled_date: input.scheduled_date ?? null,
      memo: input.memo ?? null,
      status: "pending"
    })
    .select("*")
    .single();
}

export async function updateJobStatus(jobId: string, status: JobStatus, userId?: string) {
  const { data: existing, error: fetchError } = await supabase
    .from("spray_jobs")
    .select("status")
    .eq("id", jobId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const patch: Record<string, string | null> = {
    status
  };

  if (status === "in_progress") {
    patch.started_at = new Date().toISOString();
  }

  if (status === "completed") {
    patch.completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from("spray_jobs").update(patch).eq("id", jobId);

  if (error) {
    throw error;
  }

  await supabase.from("job_status_logs").insert({
    job_id: jobId,
    old_status: existing.status,
    new_status: status,
    changed_by: userId ?? null
  });
}

export function subscribeFieldRealtime(onChange: () => void) {
  const channel = supabase
    .channel("spray-jobs-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "spray_jobs" },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fields" },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
