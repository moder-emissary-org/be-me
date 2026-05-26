import { User } from "@/models/User.models.js";
import type { createUserInput } from "@/services/User/Types/User.types.js";
import type { ClientSession, Types } from "mongoose";

interface sessionOptions {
  session?: ClientSession;
}

export const userRepository = {
  createUserThroughSession: async (
    data: {
      clerkUserId: string;
      role: "admin" | "resident" | "guard";
      societyId: Types.ObjectId;
      apartmentId: Types.ObjectId | null;
      isActive: boolean;
      email: string;
      fullName: string;
    },
    options?: sessionOptions // session if provided
  ) => {
    const createOptions = options?.session
      ? { session: options.session }
      : undefined;
    const docs = await User.create([data], createOptions);
    return docs[0];
  },

  updateApartmentForUser: async (
    userId: Types.ObjectId | string,
    apartmentId: Types.ObjectId | null,
    options?: sessionOptions // session if provided
  ) => {
    const createOptions = options?.session
      ? { session: options.session }
      : undefined;
    const doc = await User.findByIdAndUpdate(
      userId,
      { apartmentId },
      createOptions
    ).lean();
    return doc;
  },

  findByClerkUserId: async (clerkUserId: string) => {
    return User.findOne({ clerkUserId }).lean();
  },

  findById: async (id: string) => {
    return User.findById(id).lean();
  },

  findByEmail: async (email: string) => {
    return User.findOne({ email }).lean();
  },

  createNormalUser: async (userData: createUserInput) => {
    const user = await User.create(userData);
    return user;
  },
};
