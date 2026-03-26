import { User } from "@/models/User.models.js";
import type { ClientSession, Types } from "mongoose";

interface UpdateOptions {
  session?: ClientSession;
}

export const UpdateUser_Repository = {
  updateApartmentForUser: async (
    userId: Types.ObjectId | string,
    apartmentId: Types.ObjectId | null,
    options?: UpdateOptions
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
};
