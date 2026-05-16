export type UpdateComplaintStatusInput = {
  clerkUserId: string;
  complaintId: string;
  status: string;
  adminRemark?: string;
};
