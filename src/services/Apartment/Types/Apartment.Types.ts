import type { Types } from "mongoose";

export interface ApartmentEntity {
  _id: Types.ObjectId;
  apartmentCode: string;
  societyId: Types.ObjectId;
  towerLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

export type getApartmentsBySocietyServiceInput = {
  clerkUserId: string; 
  cursor: string | undefined;
}

export type findApartmentsBySocietyIdRepoInput = {
  societyId: Types.ObjectId;
  cursor: string | undefined;
}