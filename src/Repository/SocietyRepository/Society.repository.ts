import { Society } from "@/models/society.models.js";
import type { ClientSession } from "mongoose";

interface CountOptions {
  session?: ClientSession;
}

interface CreateOptions {
  session?: ClientSession;
}

export const societyRepository_Repository = {
  count: async (options?: CountOptions): Promise<number> => {
    const query = Society.countDocuments();

    if (options?.session) {
      query.session(options.session);
    }

    return query.exec();
  },

  create: async (
    data: { name: string; address: string },
    options?: CreateOptions
  ) => {
    console.log("Creating society with data:", data);
    const docs = await Society.create([data], {
      session: options?.session ?? null,
    });

    return docs[0];
  },
}