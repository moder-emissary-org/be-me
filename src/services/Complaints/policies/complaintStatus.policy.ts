import type { ComplaintStatus } from "@/models/Complaint.models.js";

// --- Domain policy (lifecycle rules) ---

export const ADMIN_REMARK_MAX = 500;

export type AdminSettableComplaintStatus = "in_progress" | "resolved" | "rejected";

export const ALLOWED_STATUS_TRANSITIONS: Record<
  ComplaintStatus,
  readonly AdminSettableComplaintStatus[]
> = {
  open: ["in_progress", "resolved", "rejected"],
  in_progress: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
};

export function canTransitionStatus(
  currentStatus: ComplaintStatus,
  nextStatus: AdminSettableComplaintStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

// --- Input validation (update status pipeline) ---

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isAdminSettableStatus(value: string): value is AdminSettableComplaintStatus {
  return value === "in_progress" || value === "resolved" || value === "rejected";
}

export function parseAdminSettableStatus(rawStatus: unknown): AdminSettableComplaintStatus | null {
  const status = trimString(rawStatus);
  return isAdminSettableStatus(status) ? status : null;
}

export type ParsedAdminRemark = {
  adminRemark: string | undefined;
};

export type AdminRemarkValidationError =
  | { code: "ADMIN_REMARK_EMPTY" }
  | { code: "ADMIN_REMARK_TOO_LONG"; remarkLength: number };

export function parseAdminRemark(
  rawAdminRemark: unknown
): ParsedAdminRemark | AdminRemarkValidationError {
  if (rawAdminRemark === undefined) {
    return { adminRemark: undefined };
  }

  const adminRemark = trimString(rawAdminRemark);

  if (!adminRemark) {
    return { code: "ADMIN_REMARK_EMPTY" };
  }

  if (adminRemark.length > ADMIN_REMARK_MAX) {
    return { code: "ADMIN_REMARK_TOO_LONG", remarkLength: adminRemark.length };
  }

  return { adminRemark };
}
