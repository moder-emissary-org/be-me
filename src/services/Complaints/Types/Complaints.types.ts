import type { ComplaintStatus } from "@/models/Complaint.models.js";
import type { Types } from "mongoose";

// main entity interface for complaints
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
  adminRemark: string | null;
}

// service types
export type UpdateComplaintStatusInput = {
  clerkUserId: string;
  complaintId: string;
  status: string;
  adminRemark?: string;
};

// repository types
export type CreateComplaintRepositoryInput = Omit<ComplaintEntity, "_id">;

export type UpdateComplaintStatusRepositoryInput = {
  complaintId: Types.ObjectId;
  status: ComplaintStatus;
  adminRemark?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
};