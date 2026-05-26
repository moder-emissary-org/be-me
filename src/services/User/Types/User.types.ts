import type { Types } from "mongoose";

export interface UserEntity {
  _id: Types.ObjectId;
  clerkUserId: string;
  fullName: string;
  email: string;
  role: "resident" | "admin" | "guard";
  societyId: Types.ObjectId;
  apartmentId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// service types.
export interface InviteUserInput {
  email: string;
  role: "resident" | "guard";
  invitedBy: string; // clerkUserId of admin
}

export type createUserInput = Omit<
  UserEntity,
  "_id" | "createdAt" | "updatedAt"
>;
