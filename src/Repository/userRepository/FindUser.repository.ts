import { User } from "@/models/User.models.js"

export const findUserByID_Repository = {
  findByClerkUserId: async (clerkUserId: string) => {
    return User.findOne({ clerkUserId }).lean();
  },

  findById: async (id: string) => {
    return User.findById(id).lean();
  },

  findByEmail: async (email: string) => {
    return User.findOne({ email }).lean();
  },
}