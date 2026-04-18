import mongoose, { Schema } from "mongoose";

const invitationSchema = new Schema({
  email: { type: String, required: true, index: true },
  role: { type: String, enum: ['resident', 'guard'], required: true },
  societyId: { type: Schema.Types.ObjectId, required: true },
  apartmentId: { type: Schema.Types.ObjectId, default: null },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }
}, { timestamps: true });

invitationSchema.index(
  { email: 1, societyId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export const Invitation = mongoose.model("Invitation", invitationSchema);