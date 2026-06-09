import { create } from "zustand";
import { sampleFields } from "@/src/mocks/sampleData";
import { Farmer, FieldWithRelations, GeoJsonPolygon, JobStatus, SprayTeam } from "@/src/types/domain";

type SampleTeamInput = {
  team_name: string;
  manager_name?: string | null;
  phone?: string | null;
};

type SampleFieldInput = {
  farmer: Farmer | null;
  farmerName: string;
  farmerPhone?: string | null;
  address?: string | null;
  fieldName: string;
  centerLat: number;
  centerLng: number;
  polygon: GeoJsonPolygon;
  cropName?: string | null;
  scheduledDate?: string | null;
  teamId?: string | null;
};

function getInitialSampleTeams() {
  const teams = sampleFields.map((item) => item.team).filter(Boolean) as SprayTeam[];
  return Array.from(new Map(teams.map((team) => [team.id, team])).values());
}

type AppState = {
  selectedField: FieldWithRelations | null;
  sampleFields: FieldWithRelations[];
  sampleTeams: SprayTeam[];
  setSelectedField: (field: FieldWithRelations | null) => void;
  addSampleTeam: (input: SampleTeamInput) => SprayTeam;
  updateSampleTeam: (teamId: string, input: SampleTeamInput) => void;
  addSampleField: (input: SampleFieldInput) => FieldWithRelations;
  updateSampleJobStatus: (jobId: string, status: JobStatus) => void;
  addSampleJobPhoto: (jobId: string, uri: string) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  selectedField: null,
  sampleFields,
  sampleTeams: getInitialSampleTeams(),
  setSelectedField: (field) => set({ selectedField: field }),
  addSampleTeam: (input) => {
    const now = new Date().toISOString();
    const team: SprayTeam = {
      id: `sample-team-${Date.now()}`,
      team_name: input.team_name,
      manager_name: input.manager_name ?? null,
      phone: input.phone ?? null,
      created_at: now
    };

    set((state) => ({
      sampleTeams: [team, ...state.sampleTeams]
    }));

    return team;
  },
  updateSampleTeam: (teamId, input) =>
    set((state) => ({
      sampleTeams: state.sampleTeams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              team_name: input.team_name,
              manager_name: input.manager_name ?? null,
              phone: input.phone ?? null
            }
          : team
      ),
      sampleFields: state.sampleFields.map((item) =>
        item.team?.id === teamId
          ? {
              ...item,
              team: {
                ...item.team,
                team_name: input.team_name,
                manager_name: input.manager_name ?? null,
                phone: input.phone ?? null
              }
            }
          : item
      )
    })),
  addSampleField: (input) => {
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const fieldId = `sample-field-${timestamp}`;
    const farmer =
      input.farmer ??
      ({
        id: `sample-farmer-${timestamp}`,
        name: input.farmerName,
        phone: input.farmerPhone ?? null,
        address: input.address ?? null,
        memo: null,
        created_at: now
      } satisfies Farmer);
    const team = get().sampleTeams.find((item) => item.id === input.teamId) ?? null;
    const createdItem: FieldWithRelations = {
      field: {
        id: fieldId,
        farmer_id: farmer.id,
        field_name: input.fieldName,
        address: input.address ?? null,
        center_lat: input.centerLat,
        center_lng: input.centerLng,
        polygon_geojson: input.polygon,
        area_size: null,
        crop_name: input.cropName ?? null,
        memo: null,
        created_at: now
      },
      farmer,
      job: {
        id: `sample-job-${timestamp}`,
        field_id: fieldId,
        farmer_id: farmer.id,
        assigned_team_id: team?.id ?? null,
        scheduled_date: input.scheduledDate ?? null,
        status: team ? "assigned" : "pending",
        started_at: null,
        completed_at: null,
        memo: null,
        created_at: now
      },
      team,
      photos: []
    };

    set((state) => {
      return {
        sampleFields: [createdItem, ...state.sampleFields]
      };
    });

    return createdItem;
  },
  updateSampleJobStatus: (jobId, status) =>
    set((state) => ({
      sampleFields: state.sampleFields.map((item) => {
        if (item.job?.id !== jobId) {
          return item;
        }

        return {
          ...item,
          job: {
            ...item.job,
            status,
            started_at:
              status === "in_progress" ? new Date().toISOString() : item.job.started_at,
            completed_at:
              status === "completed" ? new Date().toISOString() : item.job.completed_at
          }
        };
      })
    })),
  addSampleJobPhoto: (jobId, uri) =>
    set((state) => ({
      sampleFields: state.sampleFields.map((item) => {
        if (item.job?.id !== jobId) {
          return item;
        }

        return {
          ...item,
          job: {
            ...item.job,
            status: "completed",
            completed_at: item.job.completed_at ?? new Date().toISOString()
          },
          photos: [
            ...item.photos,
            {
              id: `sample-photo-${Date.now()}`,
              job_id: jobId,
              photo_url: uri,
              uploaded_by: null,
              uploaded_at: new Date().toISOString()
            }
          ]
        };
      })
    }))
}));
