import type { Types } from "mongoose";
import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { findUserByID_Repository } from "@/repository/UserRepository/FindUser.repository.js";
import { UserRepository_Repository } from "@/repository/UserRepository/UserRepository.repository.js";
import { UpdateUser_Repository } from "@/repository/UserRepository/UpdateUser.repository.js";
import { FindSociety_repository } from "@/repository/SocietyRepository/FindSociety.repository.js";
import { FindApartment_Repository } from "@/repository/ApartmentRepository/FindApartment.repository.js";
import {
  ClerkIdentityProvider_Service,
  type InvitationPublicMetadata,
} from "@/services/Identity/IdentityProvider.service.js";
import mongoose from "mongoose";
import { InvitationRepository } from "@/repository/InvitationRepository/Invitation.Repository.js";
import { Invitation } from "@/models/Invitation.models.js";

// --- Invite User (Clerk invitation; no DB write) ---

export interface InviteUserInput {
  email: string;
  role: "resident" | "guard";
  invitedBy: string; // clerkUserId of admin
}

export const inviteUser_Service = async (
  input: InviteUserInput
): Promise<{ success: true; message: string }> => {
  const { email, role, invitedBy } = input;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Invalid email",
      { email }
    );
  }

  if (role !== "resident" && role !== "guard") {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Invalid role",
      { role }
    );
  }

  const adminUser = await findUserByID_Repository.findByClerkUserId(invitedBy);
  if (!adminUser) {
    throw new ServiceError(
      "ADMIN_NOT_FOUND",
      "Admin account not found",
      { clerkUserId: invitedBy },
    );
  }

  if (adminUser.role !== "admin") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Unauthorized operation",
      { role: adminUser.role },
    );
  }

  if (!adminUser.isActive) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Unauthorized operation",
      { reason: "Admin disabled" },
    );
  }

  const societyId = adminUser.societyId;
  if (!societyId) {
    throw new ServiceError(
      "SOCIETY_NOT_FOUND",
      "Admin has no society",
      { clerkUserId: invitedBy },
    );
  }

  const existingInvitation = await InvitationRepository.findPendingByEmail(email);
  if (existingInvitation) {
    throw new ServiceError(
      "INVITATION_ALREADY_EXISTS",
      "User already invited",
      { email }
    );
  }

  await InvitationRepository.create({
    email,
    role,
    societyId: String(societyId),
    invitedBy,
  })

  const metadata: InvitationPublicMetadata = {
    societyId: String(societyId),
    role,
    invitedBy: adminUser.clerkUserId,
  };

  try {
    await ClerkIdentityProvider_Service.createInvitation(email, metadata);
  } catch {
    await Invitation.deleteOne({email})

    throw new ServiceError(
      "INVITATION_FAILED",
      "Failed to send invitation",
      { email }
    );
  }

  return { success: true, message: "Invitation sent successfully" };
};

// --- Create User from Clerk user.created webhook ---

export interface CreateUserFromClerkWebhookInput {
  clerkUserId: string;
  email: string;
}

export const createUserFromClerkWebhook_Service = async (
  input: CreateUserFromClerkWebhookInput
): Promise<{ created: boolean }> => {
  const { clerkUserId, email } = input;

  const existing = await findUserByID_Repository.findByClerkUserId(clerkUserId);
  if (existing) {
    return { created: false}
  }

  console.log("existing check passed")

  const invitation = await InvitationRepository.findPendingByEmail(email); 
  if (!invitation) {
    return { created: false };
  }

  const { role, societyId } = invitation;
  if (!societyId || !role) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Missing metadata: only invited users are registered",
      { clerkUserId }
    );
  }

  if (role !== "resident" && role !== "guard") {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Invalid role: must be 'resident' or 'guard'",
      { role, clerkUserId }
    );
  }

  console.log("role check passed");

  const society = await FindSociety_repository.findById(societyId);
  if (!society) {
    throw new ServiceError(
      "SOCIETY_NOT_FOUND",
      "Society not found",
      { societyId, clerkUserId }
    );
  }
  
  console.log("society check passed")

  const { getProfile } = ClerkIdentityProvider_Service;
  const profile = await getProfile(clerkUserId);
  const fullName = profile.fullName || email;

  console.log("successfull full name extraction from indetity provider: ", fullName);
  console.log("DB NAME:", mongoose.connection.name);
  console.log("DB HOST:", mongoose.connection.host);

  const result = await UserRepository_Repository.createUserThroughSession(
    {
      clerkUserId,
      email,
      fullName,
      role,
      societyId: society._id,
      apartmentId: null,
      isActive: true,
    }
  );
  console.log("createUserFromClerkWebhook_Service result:", result)

  return { created: true };
};

// --- Assign User to Apartment (membership) ---

export interface AssignUserToApartmentInput {
  userId: string;
  apartmentId: string;
  requestedBy: string; // clerkUserId of admin
}

export const assignUserToApartment_Service = async (
  input: AssignUserToApartmentInput
): Promise<{ success: true }> => {
  const { userId, apartmentId, requestedBy } = input;

  const adminUser = await findUserByID_Repository.findByClerkUserId(requestedBy);
  if (!adminUser) {
    throw new ServiceError("USER_NOT_FOUND", "Admin account not found", {
      clerkUserId: requestedBy,
    });
  }

  if (adminUser.role !== "admin") {
    throw new ServiceError("OPERATION_NOT_ALLOWED", "Unauthorized operation", {
      role: adminUser.role,
    });
  }

  if (!adminUser.isActive) {
    throw new ServiceError("OPERATION_NOT_ALLOWED", "Unauthorized operation", {
      reason: "Admin disabled",
    });
  }

  const targetUser = await findUserByID_Repository.findById(userId);
  if (!targetUser) {
    throw new ServiceError("USER_NOT_FOUND", "User not found", { userId });
  }

  if (!targetUser.isActive) {
    throw new ServiceError("OPERATION_NOT_ALLOWED", "User is not active", {
      userId,
    });
  }

  if (String(targetUser.societyId) !== String(adminUser.societyId)) {
    throw new ServiceError(
      "APARTMENT_SCOPE_INVALID",
      "User does not belong to the same society",
      { userId, requestedBy }
    );
  }

  const apartment = await FindApartment_Repository.findById(apartmentId);
  if (!apartment) {
    throw new ServiceError("APARTMENT_NOT_FOUND", "Apartment not found", {
      apartmentId,
    });
  }

  if (String(apartment.societyId) !== String(adminUser.societyId)) {
    throw new ServiceError(
      "APARTMENT_SCOPE_INVALID",
      "Apartment does not belong to the same society",
      { apartmentId, requestedBy }
    );
  }

  await UpdateUser_Repository.updateApartmentForUser(userId, apartment._id);

  return { success: true };
};
