import { Complaint } from "@/models/Complaint.models.js";
import type { ComplaintCategory, ComplaintStatus } from "@/models/Complaint.models.js";
import type { Types } from "mongoose";

export type CreateComplaintRepositoryInput = {
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  societyId: Types.ObjectId;
  apartmentId: Types.ObjectId;
  createdBy: Types.ObjectId;
  resolvedBy: null;
  resolvedAt: null;
  adminRemark: null;
};

export const complaints_Repository = {
  create: async (payload: CreateComplaintRepositoryInput) => {
    return Complaint.create(payload);
  },
};
