import { Invitation } from "@/models/Invitation.models.js";

export const InvitationRepository = {
  async create(data: {
    email: string;
    role: "resident" | "guard";
    societyId: string;
    invitedBy: string;
  }) {
    return Invitation.create(data);
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