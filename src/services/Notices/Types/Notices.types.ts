import type { Types } from "mongoose";

// un-used
export interface createNoticeControllerInput {
    title?: unknown;
    content?: unknown;
}

export interface CreateNoticeServiceInput {
    clerkUserId: string;
    title: string;
    content: string;
}

export interface CreateNoticeRepoInput {
    title: string; 
    content: string; 
    societyId: Types.ObjectId;
    createdBy: Types.ObjectId;
    isArchived: boolean; 
}
