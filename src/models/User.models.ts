import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true, // display-only
    },
    email: {
      type: String,
      required: true,
      unique: true, // display + filtering only
    },
    role: {
      type: String,
      enum: ["resident", "admin", "guard"],
      required: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },
    apartmentId: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: false, // required only for residents
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
