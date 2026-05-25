import type { Types } from "mongoose";

// un-used
export interface createNoticeControllerInput {
    title?: unknown;
    content?: unknown;
};

export interface NoticeEntity {
    _id: Types.ObjectId;

    title: string;
    content: string;

    societyId: Types.ObjectId;
    createdBy: Types.ObjectId;

    isArchived: boolean;

    createdAt: Date;
    updatedAt: Date;
};

export type CreateNoticeRepoInput = Omit<
  NoticeEntity,
  "_id" | "createdAt" | "updatedAt"
>;

export interface CreateNoticeServiceInput {
    clerkUserId: string;
    title: string;
    content: string;
};

export type getNoticesServicesInput = {
    clerkUserId: string; 
    cursor: string | undefined; 
}