import { Invitation } from "@/models/Invitation.models.js";
import type { ClientSession, Types } from "mongoose";

interface CreateOptions {
  session?: ClientSession;
}

export const InvitationRepository = {
  async create(
    data: {
      email: string;
      role: "resident" | "guard";
      societyId: Types.ObjectId;
      invitedBy: string;
    },
    options?: CreateOptions) {
    const createOptions = options?.session
      ? { session: options.session }
      : undefined;
    return Invitation.create([data], createOptions);
  },

  async findPendingByEmail(email: string) {
    return Invitation.findOne({ email, status: "pending" });
  },

  async markAccepted(email: string) {
    return Invitation.updateOne(
      { email },
      { status: "accepted" }
    );
  },
};