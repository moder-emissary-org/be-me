import type { Types } from "mongoose";

export interface ApartmentEntity {
  _id: Types.ObjectId;
  apartmentCode: string;
  societyId: Types.ObjectId;
  towerLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

// service types
export interface CreateApartmentInput {
  apartmentCode: string;
  towerLabel: string;
  clerkUserId: string; // from controller, not body, imp for admin verification and society association
}

export interface CreateApartmentOutput {
  apartmentCode: string;
  towerLabel?: string | null;
  societyId: Types.ObjectId;
  createdAt: Date;
}

export type getApartmentsBySocietyServiceInput = {
  clerkUserId: string;
  cursor: string | undefined;
};

// repository types
export type findApartmentsBySocietyIdRepoInput = {
  societyId: Types.ObjectId;
  cursor: string | undefined;
};
