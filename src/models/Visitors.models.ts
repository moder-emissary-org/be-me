import mongoose from "mongoose";

const { Schema } = mongoose;

const visitorSchema = new Schema(
  {
    name: { type: String, required: true },
    purpose: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
    },
    visitStatus: {
      type: String,
      enum: ["expected", "checked_in", "checked_out"],
      required: true,
      default: "expected",
    },
    apartmentId: { type: Schema.Types.ObjectId, ref: "Apartment", required: true },
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true },
    expectedAt: { type: Date, required: true },
    actualEntryAt: { type: Date },
    actualExitAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    contactNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export const Visitor = mongoose.model("Visitor", visitorSchema);