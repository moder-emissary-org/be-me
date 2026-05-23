import { Complaint } from "@/models/Complaint.models.js";
import type { ComplaintCategory, ComplaintStatus } from "@/models/Complaint.models.js";
import { paginate } from "@/Pagination/Pagination.service.js";
import { GLOBAL_PAGINATION_LIMIT } from "@/utils/utility.js";
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

    return await Complaint.findByIdAndUpdate(complaintId, update, {
      new: true,
      runValidators: true,
    });
  },

  // paginated complaints by society id
  findComplaintsBySocietyId: async (societyId: Types.ObjectId, cursor?: string) => {
    const doc = await paginate({
      model: Complaint,
      query: { societyId },
      limit: GLOBAL_PAGINATION_LIMIT,
      cursor: cursor,
      cursorField: "createdAt",
      sortOrder: -1,
      populate: ["createdBy", "resolvedBy"],
    });
    return doc;

  },

  findComplaintsByApartmentId: async (apartmentId: Types.ObjectId, cursor?: string) => {
    const doc = await paginate({
      model: Complaint,
      query: { apartmentId },
      limit: GLOBAL_PAGINATION_LIMIT,
      cursor: cursor,
      cursorField: "createdAt",
      sortOrder: -1,
      populate: ["resolvedBy"],
    });
    return doc; 
  }
};
