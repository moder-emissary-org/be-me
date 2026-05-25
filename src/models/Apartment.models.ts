import type { ApartmentEntity } from "@/services/Apartment/Types/Apartment.Types.js";
import mongoose, { Schema } from "mongoose";

const ApartmentSchema = new Schema(
  {
    apartmentCode: {
      type: String,
      required: true,
      unique: false, // Not unique across the entire system, but should be unique within a society
    },
    societyId: {
      type: mongoose.Types.ObjectId,
      ref: "Society",
      required: true
    },
    towerLabel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * This brings the unique constraint to the combination of societyId and apartmentCode, 
 * allowing the same apartmentCode to exist in different societies but not duplicate within the same society at DB level.
 */
ApartmentSchema.index(
  {societyId: 1, apartmentCode: 1},
  { unique: true }
); 

// for efficient pagination of apartments within a society. 
ApartmentSchema.index({
  societyId: 1,
  createdAt: -1,
  _id: -1,
});

export const Apartment = mongoose.model<ApartmentEntity>("Apartment", ApartmentSchema);