import { create } from "zustand";
import { sampleFields } from "@/src/mocks/sampleData";
import { FieldWithRelations, JobStatus } from "@/src/types/domain";

type AppState = {
  selectedField: FieldWithRelations | null;
  sampleFields: FieldWithRelations[];
  setSelectedField: (field: FieldWithRelations | null) => void;
  updateSampleJobStatus: (jobId: string, status: JobStatus) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedField: null,
  sampleFields,
  setSelectedField: (field) => set({ selectedField: field }),
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
    }))
}));
