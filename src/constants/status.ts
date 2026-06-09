import { JobStatus } from "@/src/types/domain";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "방제 예정",
  assigned: "팀 배정 완료",
  in_progress: "방제 진행중",
  completed: "방제 완료",
  issue: "문제 발생",
  cancelled: "취소"
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  pending: "#2563EB",
  assigned: "#7C3AED",
  in_progress: "#EAB308",
  completed: "#16A34A",
  issue: "#DC2626",
  cancelled: "#6B7280"
};

export const DASHBOARD_STATUS_ORDER: JobStatus[] = [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "issue",
  "cancelled"
];
