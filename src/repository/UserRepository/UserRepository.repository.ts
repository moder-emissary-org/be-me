import { User } from "@/models/User.models.js";
import type { ClientSession, Types } from "mongoose";

interface CreateOptions {
  session?: ClientSession;
}

export const UserRepository_Repository = {
  createUserThroughSession: async (
    data: {
      clerkUserId: string;
      role: "admin" | "resident" | "guard";
      societyId: Types.ObjectId;
      apartmentId?: Types.ObjectId | null;
      isActive: boolean;
      email: string;
      fullName: string;
    },
    options?: CreateOptions
  ) => {
    const createOptions = options?.session
      ? { session: options.session }
      : undefined;
    const docs = await User.create([data], createOptions);
    return docs[0];
  },
};
