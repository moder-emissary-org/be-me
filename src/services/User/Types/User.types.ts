import type { Types } from "mongoose";

export interface UserEntity {
  _id: Types.ObjectId;
  clerkUserId: string;
  fullName: string;
  email: string;
  role: "resident" | "admin" | "guard";
  societyId: Types.ObjectId;
  apartmentId?: Types.ObjectId | null;
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

export type getUsersBySocietyServiceInput = {
  clerkUserId: string; 
  cursor?: string | undefined;
  filters: GetUsersFilters;
}

export type GetUsersFilters = {
  role?: "resident" | "guard" | undefined;
  isActive?: boolean | undefined;
  apartmentAssigned?: boolean | undefined;
  search?: string | undefined;
};

export type getUsersBySocietyRepoInput = {
  societyId: Types.ObjectId; 
  cursor?: string | undefined;
  filters: GetUsersFilters;
}

export type getUserDetailsServiceInput = {
  targetUserId: string; 
  requestedBy: string; // clerkUserId of requester
}

