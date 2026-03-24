import mongoose, { Schema, Types } from "mongoose";


export interface ApartmentDocument {
  apartmentCode: string;
  societyId: Types.ObjectId;
  towerLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApartmentSchema = new Schema<ApartmentDocument>(
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

// This brings the unique constraint to the combination of societyId and apartmentCode, allowing the same apartmentCode to exist in different societies but not duplicate within the same society at DB level.
ApartmentSchema.index(
  {societyId: 1, apartmentCode: 1},
  { unique: true }
)

export const Apartment = mongoose.model<ApartmentDocument>("Apartment", ApartmentSchema);