import { User } from "@/models/User.models.js";
import type { Types } from "mongoose";

interface createUserInput {
  clerkUserId: string;
  fullName: string;
  email: string; 
  role: "admin" | "resident" | "guard";
  societyId: Types.ObjectId;
  apartmentId?: Types.ObjectId | null; // optional, only for residents
  isActive: boolean;
}

export const saveUser_Repository = {
  createNormalUser: async (userData: createUserInput) => {
    const user = await User.create(userData);
    return user;
  }   
}