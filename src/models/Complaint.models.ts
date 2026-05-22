import type { ComplaintEntity } from "@/services/Complaints/Types/Complaints.types.js";
import mongoose, { Schema } from "mongoose";

export const COMPLAINT_CATEGORIES = [
  "maintenance",
  "security",
  "cleanliness",
  "parking",
  "noise",
  "water",
  "electricity",
  "other",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export type ComplaintStatus = "open" | "in_progress" | "resolved" | "rejected";

const ComplaintSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },

  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "rejected"],
    default: "open",
  },

  category: {
    type: String,
    enum: COMPLAINT_CATEGORIES,
    required: true,
  },

  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  resolvedAt: {
    type: Date
  },

  adminRemark: {
    type: String
  },

  createdBy: {
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

ComplaintSchema.index({ societyId: 1, createdAt: -1 });

ComplaintSchema.index({ createdBy: 1, createdAt: -1 });

ComplaintSchema.index({ societyId: 1, status: 1 });

export const Complaint = mongoose.model<ComplaintEntity>("Complaint", ComplaintSchema);