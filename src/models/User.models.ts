import type { UserEntity } from "@/services/User/Types/User.types.js";
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

// normal queries by society with createdAt desc
UserSchema.index({ societyId: 1, createdAt: -1 });

// role by filtering
UserSchema.index({
  societyId: 1,
  role: 1,
  createdAt: -1,
});

// apartment by filtering
UserSchema.index({
  societyId: 1,
  apartmentId: 1,
  createdAt: -1,
});

// active users by filtering (eg. for sending notifications to active residents of a society)
UserSchema.index({
  societyId: 1,
  isActive: 1,
  createdAt: -1,
});

export const User = mongoose.model<UserEntity>("User", UserSchema);
