import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { clerkClient } from "@clerk/express";

export interface ClerkProfile {
  clerkUserId: string;
  email: string;
  fullName: string | null;
}

export interface InvitationPublicMetadata {
  societyId: string;
  role: "resident" | "guard";
  invitedBy: string;
  [key: string]: unknown;
}

// Only For Clerk Related Operations
export const ClerkIdentityProvider_Service = {
  async createInvitation(
    email: string,
    publicMetadata: InvitationPublicMetadata
  ): Promise<{ id: string }> {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: publicMetadata,
      redirectUrl: 'http://localhost:3000/'
    });
    return { id: invitation.id };
  },

  async getProfile(clerkUserId: string): Promise<ClerkProfile> {
    const user = await clerkClient.users.getUser(clerkUserId);
    if (!user) {
      throw new ServiceError(
        "SERVICE_INPUT_INVALID",
        "Email Id should be exist in Clerk for bootstrapping to work",
        { clerkUserId }
      );
    }

    const email =
      user.emailAddresses?.[0]?.emailAddress ??
      user.primaryEmailAddress?.emailAddress;

    if (!email) {
      throw new ServiceError(
        "SERVICE_INPUT_INVALID",
        "Clerk user must have an email address",
        { clerkUserId }
      );
    }

    const fullName =
      user.fullName ??
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    return {
      clerkUserId,
      email,
      fullName: fullName || null,
    };
  },
}