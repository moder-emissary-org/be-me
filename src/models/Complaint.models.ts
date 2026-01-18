import mongoose, { Schema } from "mongoose";

const ComplaintSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "resolved", "closed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  societyId: {
    type: mongoose.Types.ObjectId,
    ref: "Society",
    required: true
  },
  apartmentId: {
    type: mongoose.Types.ObjectId,
    ref: "Apartment",
    required: true
  },
}, { timestamps: true });

export const Complaint = mongoose.model("Complaint", ComplaintSchema);