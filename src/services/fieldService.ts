import { supabase } from "@/src/lib/supabase";
import { env } from "@/src/lib/env";
import {
  Farmer,
  Field,
  FieldWithRelations,
  GeoJsonPolygon,
  JobStatus,
  SprayTeam
} from "@/src/types/domain";

export async function fetchFields(): Promise<FieldWithRelations[]> {
  if (!env.isSupabaseConfigured) {
    throw new Error("Supabase 환경변수가 없어 샘플 데이터를 표시합니다.");
  }

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
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

  return supabase.from("fields").insert(input).select("*").single();
}

export async function searchFarmers(query: string): Promise<Farmer[]> {
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

  const keyword = query.trim();

  if (!keyword) {
    return [];
  }

  const { data, error } = await supabase
    .from("farmers")
    .select("*")
    .or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchSprayTeams(): Promise<SprayTeam[]> {
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

  const { data, error } = await supabase
    .from("spray_teams")
    .select("*")
    .order("team_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createSprayTeam(input: {
  team_name: string;
  manager_name?: string | null;
  phone?: string | null;
}) {
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

  return supabase
    .from("spray_teams")
    .insert({
      team_name: input.team_name,
      manager_name: input.manager_name ?? null,
      phone: input.phone ?? null
    })
    .select("*")
    .single();
}

export async function createFarmer(input: {
  name: string;
  phone?: string | null;
  address?: string | null;
  memo?: string | null;
}) {
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

  return supabase
    .from("farmers")
    .insert({
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      memo: input.memo ?? null
    })
    .select("*")
    .single();
}

export async function createSprayJob(input: {
  field_id: string;
  farmer_id: string;
  assigned_team_id?: string | null;
  scheduled_date?: string | null;
  memo?: string | null;
}) {
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

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
  if (!env.isSupabaseConfigured) {
    throw new Error(".env에 Supabase URL과 anon key를 먼저 입력해 주세요.");
  }

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
  if (!env.isSupabaseConfigured) {
    return () => undefined;
  }

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
