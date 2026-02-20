import { ServiceError } from "@/Error/ServicesErrors/MainCatcher/ServiceError.js";
import { clerkClient } from "@clerk/express";

export interface ClerkProfile {
  clerkUserId: string;
  email: string;
  fullName: string;
}

export const ClerkIdentity_Services = {
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

    if (!fullName) {
      throw new ServiceError(
        "SERVICE_INPUT_INVALID",
        "Clerk user must have a full name",
        { clerkUserId }
      );
    }

    return {
      clerkUserId,
      email,
      fullName,
    };
  },
}