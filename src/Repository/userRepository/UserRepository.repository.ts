import { User } from "@/models/User.models.js";
import type { ClientSession } from "mongoose";

interface CreateOptions {
  session?: ClientSession;
}

export const UserRepository_Repository = {
  create: async (
  data: {
    clerkUserId: string;
    role: "admin" | "resident" | "guard";
    societyId: any;
    isActive: boolean;
    email: string; 
    fullName: string; 
  },
  options?: CreateOptions
) => {
  console.log("Creating user with data:", data);
  const docs = await User.create([data], {
    session: options?.session ?? null,
  });

  return docs[0];
},

};
