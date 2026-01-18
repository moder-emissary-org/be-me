import mongoose, { Schema } from "mongoose";

const ApartmentSchema = new Schema(
  {
    apartmentCode: {
      type: String,
      required: true,
      unique: true
    },
    societyId: {
      type: mongoose.Types.ObjectId,
      ref: "Society",
      required: true
    },
    towerLabel: {
      type: String,
      required: false,
      // Examples: "Tower A", "Block 3"
      // Display-only in MVP
    },
  },
  { timestamps: true }
);

export const Apartment = mongoose.model("Apartment", ApartmentSchema);