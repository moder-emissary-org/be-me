import type { Types } from "mongoose";

export type UpdateComplaintStatusInput = {
  clerkUserId: string;
  complaintId: string;
  status: string;
  adminRemark?: string;
};

export interface ComplaintEntity {
  _id: Types.ObjectId;

  title: string;
  description: string;
  category: string;
  status: string;

  societyId: Types.ObjectId;
  apartmentId: Types.ObjectId;
  createdBy: Types.ObjectId;

  resolvedBy: null;
  resolvedAt: null;

  adminRemark: null;
}