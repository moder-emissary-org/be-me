import { Visitor } from "@/models/Visitors.models.js";
import type { Types } from "mongoose";

export type CreateVisitorRepoInput = {
  name: string;
  purpose: string;
  contactNumber: string;
  apartmentId: Types.ObjectId;
  societyId: Types.ObjectId;
  expectedAt: Date;

  approvalStatus: "pending";
  visitStatus: "expected";

  approvedBy: Types.ObjectId | null;
  actualEntryAt: Date | null;
  actualExitAt: Date | null;
};

export type FindPendingByApartmentInput = {
  societyId: Types.ObjectId;
  apartmentId: Types.ObjectId;
  limit: number;
  cursor: string | undefined;
};

export type updateApprovalStatusRepoInput = {
  visitorId: Types.ObjectId;
  approvalStatus: "approved" | "rejected";
  approvedBy: Types.ObjectId;
}

export const visitorRepository = {
  create: async (data: CreateVisitorRepoInput) => {
    const visitor = await Visitor.create(data);
    return visitor;
  },
  findById: async (id: Types.ObjectId) => {
    const visitor = await Visitor.findById(id);
    return visitor;
  },
  findPendingByApartment: async (input: FindPendingByApartmentInput) => {
    const { societyId, apartmentId, limit, cursor } = input;
    const query: any = {
      societyId,
      apartmentId,
      approvalStatus: "pending",
    };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }
    return Visitor.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },
  updateApprovalStatus: async ({
    visitorId,
    approvalStatus,
    approvedBy,
  }: updateApprovalStatusRepoInput) => {
    const visitor = await Visitor.findByIdAndUpdate(
      visitorId,
      { approvalStatus, approvedBy },
      { new: true, runValidators: true }
    );
    return visitor;
  },
  // not tested and used yet 
  findByApartmentId: async (apartmentId: Types.ObjectId) => {
    const visitors = await Visitor.find({ apartmentId });
    return visitors;
  },

  // not tested and used yet 
  findBySocietyId: async (societyId: Types.ObjectId) => {
    const visitors = await Visitor.find({ societyId });
    return visitors;
  },
}