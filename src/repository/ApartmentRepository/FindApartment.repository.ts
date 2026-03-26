import { Apartment } from "@/models/Apartment.models.js";
import type { Types } from "mongoose";

export const FindApartment_Repository = {
  findById: async (id: Types.ObjectId | string) => {
    return await Apartment.findById(id).lean();
  },
  findBySocietyIdAndApartmentCode: async (societyId: Types.ObjectId, apartmentCode: string) => {
    return await Apartment.findOne({ societyId, apartmentCode }).lean();
  }
}