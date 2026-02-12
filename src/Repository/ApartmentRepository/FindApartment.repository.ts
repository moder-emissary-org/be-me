import { Apartment } from "@/models/Apartment.models.js";
import type { Types } from "mongoose";

export const FindApartment_repository = {
  findById: async (id: Types.ObjectId | string) => Apartment.findById(id).lean(),
}