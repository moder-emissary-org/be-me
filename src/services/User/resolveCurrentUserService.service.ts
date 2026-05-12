import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { FindApartment_Repository } from "@/repository/ApartmentRepository/FindApartment.repository.js";
import { FindSociety_repository } from "@/repository/SocietyRepository/FindSociety.repository.js";
import { findUserByID_Repository } from "@/repository/UserRepository/FindUser.repository.js";
import { Types } from "mongoose";

// This service is responsible for resolving the current user's details, including their associated society and apartment information, based on their Clerk user ID. It is used in the GetCurrentUser controller to provide a comprehensive user profile for the frontend application.

export const resolveCurrentUser_Service = async ({
  clerkUserId,
}: {
  clerkUserId: string;
}) => {
  const user = await findUserByID_Repository.findByClerkUserId(clerkUserId);  
  if (!user || !user.isActive) {
    throw new ServiceError(
      "USER_NOT_FOUND",
      "No user found for the given Clerk user ID",
      { clerkUserId }
    )
  }

  const society = await FindSociety_repository.findById(user.societyId);
  if (!society) {
    throw new ServiceError(
      "SOCIETY_NOT_FOUND",
      "No society found for the user's society ID",
      { societyId: user.societyId }
    )
  }

  const apartment = user.apartmentId
    ? await FindApartment_Repository.findById(user.apartmentId)
    : null;

  return {
    user: {
      id: user._id.toString(),
      clerkUserId: user.clerkUserId,
      fullName: user.fullName ?? null,
      isActive: user.isActive,
    },
    authority: {
      role: user.role,
    },
    scope: {
      society: {
        id: society._id,
        name: society.name,
      },
      apartment: apartment
        ? {
          id: apartment._id,
          code: apartment.apartmentCode,
        }
        : null,
    },
    meta: {
      onboardingComplete: true,  
    },
  };
}