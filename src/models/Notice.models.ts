import mongoose, { Schema } from "mongoose";

const NoticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
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

    isActive: {
      type: Boolean,
      default: true, // soft hide
    },
  },
  { timestamps: true }
);

export const Notice = mongoose.model("Notice", NoticeSchema);
