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

export const visitorRepository = {
    create: async (data: CreateVisitorRepoInput) => {
        const visitor = await Visitor.create(data);
        return visitor;
    }
}