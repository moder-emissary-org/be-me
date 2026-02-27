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
      required: false,
    },
  },
  { timestamps: true }
);

export const Apartment = mongoose.model("Apartment", ApartmentSchema);