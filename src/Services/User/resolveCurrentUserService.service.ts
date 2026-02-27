import { ServiceError } from "@/Error/ServicesErrors/MainCatcher/ServiceError.js";
import { FindApartment_repository } from "@/Repository/ApartmentRepository/FindApartment.repository.js";
import { FindSociety_repository } from "@/Repository/SocietyRepository/FindSociety.repository.js";
import { findUserByID_Repository } from "@/Repository/userRepository/FindUser.repository.js";

// This service is responsible for resolving the current user's details, including their associated society and apartment information, based on their Clerk user ID. It is used in the GetCurrentUser controller to provide a comprehensive user profile for the frontend application.

export const resolveCurrentUser_Service = async ({
  clerkUserId,
}: {
  clerkUserId: string;
}) => {

  const user = await findUserByID_Repository.findByClerkUserId(clerkUserId);

  console.log("Resolve Current User Service hit. Found user: ", user);  
  
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
    ? await FindApartment_repository.findById(user.apartmentId)
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
        id: society._id.toString(),
        name: society.name,
      },
      apartment: apartment
        ? {
          id: apartment._id.toString(),
          code: apartment.apartmentCode,
        }
        : null,
    },
    meta: {
      onboardingComplete: true,  
    },
  };
}