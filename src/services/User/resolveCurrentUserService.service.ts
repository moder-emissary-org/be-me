import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { apartmentRepository } from "@/repository/ApartmentRepository/Apartment.repository.js";
import { FindSociety_repository } from "@/repository/SocietyRepository/FindSociety.repository.js";
import { userRepository } from "@/repository/UserRepository/User.repository.js";

// This service is responsible for resolving the current user's details, including their associated society and apartment information, based on their Clerk user ID. It is used in the GetCurrentUser controller to provide a comprehensive user profile for the frontend application.

export const resolveCurrentUser_Service = async ({
  clerkUserId,
}: {
  clerkUserId: string;
}) => {
  const user = await userRepository.findByClerkUserId(clerkUserId); 

  if (!user) {
    throw new ServiceError(
      "USER_NOT_FOUND",
      "No user found for the given Clerk user ID.",
      { clerkUserId }
    );
  };

  if (!user.isActive) { // <--- here the isActive check is important, check PR #42 to #44
    throw new ServiceError(
      "USER_INACTIVE",
      "The user's account is inactive.",
      { clerkUserId }
    );
  }

  const society = await FindSociety_repository.findById(user.societyId);
  if (!society) {
    throw new ServiceError(
      "SOCIETY_NOT_FOUND",
      "User does not belong to a valid society.",
      { societyId: user.societyId }
    )
  }

  const apartment = user.apartmentId
    ? await apartmentRepository.findById(user.apartmentId)
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