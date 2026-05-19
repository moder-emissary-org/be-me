import { Complaint } from "@/models/Complaint.models.js";
import type { ComplaintCategory, ComplaintStatus } from "@/models/Complaint.models.js";
import { Types } from "mongoose";

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

export type UpdateComplaintStatusRepositoryInput = {
  complaintId: Types.ObjectId;
  status: ComplaintStatus;
  adminRemark?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
};

export const complaints_Repository = {
  create: async (payload: CreateComplaintRepositoryInput) => {
    return Complaint.create(payload);
  },

  findById: async (complaintId: Types.ObjectId) => {
    const doc = await Complaint.findById(complaintId);
    return doc;
  },

  updateStatus: async ({
    complaintId,
    status,
    adminRemark,
    resolvedBy,
    resolvedAt,
  }: UpdateComplaintStatusRepositoryInput) => {
    const update: Record<string, unknown> = { status };

    if (adminRemark !== undefined) {
      update.adminRemark = adminRemark;
    }
    if (resolvedBy !== undefined) {
      update.resolvedBy = resolvedBy;
    }
    if (resolvedAt !== undefined) {
      update.resolvedAt = resolvedAt;
    }

    const doc = await Complaint.findByIdAndUpdate(complaintId, update, {
      new: true,
      runValidators: true,
    });

    return doc;
  },

  findComplaintsBySocietyId: async (societyId: Types.ObjectId) => {
    const doc = await Complaint
      .find({ societyId })
      .sort({ createdAt: -1 })
      .lean();
    console.log("list all complaints scoped by societyId:", doc ? doc : "not_found");
    return doc;
  }
};
