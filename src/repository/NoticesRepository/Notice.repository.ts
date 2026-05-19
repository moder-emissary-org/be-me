import { Notice } from "@/models/Notice.models.js";
import type { CreateNoticeRepoInput } from "@/services/Notices/Types/Notices.types.js";
import type { Types } from "mongoose";

export const noticesRepository = {
    create: async (input: CreateNoticeRepoInput) => {
        const doc = await Notice.create(input);
        return doc; 
    }
}