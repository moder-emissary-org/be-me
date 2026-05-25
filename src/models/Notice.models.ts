import type { NoticeEntity } from "@/services/Notices/Types/Notices.types.js";
import mongoose, { Schema } from "mongoose";

const NoticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, 
      maxlength: 120,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    societyId: {
      type: Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // admin only (enforced in service)
    },

    isArchived: {
      type: Boolean,
      default: false, // soft hide
    },
  },
  { timestamps: true }
);

NoticeSchema.index({ societyId: 1, createdAt: -1, _id: -1 });

export const Notice = mongoose.model<NoticeEntity>("Notice", NoticeSchema);
