import { Notice } from "@/models/Notice.models.js";
import { paginate } from "@/Pagination/Pagination.service.js";
import type { CreateNoticeRepoInput } from "@/services/Notices/Types/Notices.types.js";
import { GLOBAL_PAGINATION_LIMIT } from "@/utils/utility.js";
import type { Types } from "mongoose";

export const noticesRepository = {
    create: async (input: CreateNoticeRepoInput) => {
        const doc = await Notice.create(input);
        return doc;
    },
    getNoticesBySocietyId: async (societyId: Types.ObjectId, cursor: string | undefined) => {
        const result = await paginate({
            model: Notice,
            query: { societyId },
            limit: GLOBAL_PAGINATION_LIMIT,
            cursor,
            cursorField: "createdAt"
        });
        return result;
    },
}