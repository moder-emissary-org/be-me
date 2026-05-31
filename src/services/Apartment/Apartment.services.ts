import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { apartmentRepository } from "@/repository/ApartmentRepository/Apartment.repository.js";
import { isMongoDuplicateError } from "@/utils/MongoErrors.utils.js";
import type {
  CreateApartmentInput,
  CreateApartmentOutput,
  getApartmentsBySocietyServiceInput,
} from "./Types/Apartment.Types.js";
import { resolveCurrentUser_Service } from "../User/resolveCurrentUserService.service.js";
import { userRepository } from "@/repository/UserRepository/User.repository.js";

//---------------------------------------------------------------------//
//                      create Apartment service                       //
//---------------------------------------------------------------------//

export const createApartment_Service = async (input: CreateApartmentInput): Promise<CreateApartmentOutput> => {
  const adminUser = await userRepository.findByClerkUserId(input.clerkUserId);
  if (!adminUser) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "No user found with the provided Clerk user ID.",
      { statusCode: 404 }
    )
  }

  if (adminUser.role !== "admin") {
    throw new ServiceError(
      "ROLE_CONSTRAINT_VIOLATION",
      "User does not have admin privileges.",
      { statusCode: 403 }
    );
  }

  const adminSocietyId = adminUser.societyId;

  const existingApartment =
    await apartmentRepository.findBySocietyIdAndApartmentCode(
      adminSocietyId,
      input.apartmentCode,
    );
  if (existingApartment) {
    throw new ServiceError(
      "DUPLICATE_APARTMENT_FOUND",
      "An apartment with the same code already exists in this society.",
      {
        statusCode: 409,
        societyId: adminSocietyId,
        apartmentCode: input.apartmentCode,
      },
    );
  }

  const normalizedApartmentCode = input.apartmentCode.trim().toUpperCase();
  try {
    const apartment = await apartmentRepository.create({
      apartmentCode: normalizedApartmentCode,
      towerLabel: input.towerLabel ?? undefined,
      societyId: adminSocietyId,
    });

    return {
      apartmentCode: apartment.apartmentCode,
      towerLabel: apartment.towerLabel ? apartment.towerLabel : null,
      societyId: apartment.societyId,
      createdAt: apartment.createdAt,
    };
  } catch (error: any) {
    if (isMongoDuplicateError(error)) {
      throw new ServiceError(
        "DUPLICATE_APARTMENT_FOUND",
        `Apartment '${normalizedApartmentCode}' already exists in this society.`,
        { statusCode: 409 },
      );
    }

    throw new ServiceError(
      "OPERATION_FAILED",
      "Unexpected error while creating apartment.",
      { statusCode: 500 },
    );
  }
};

//---------------------------------------------------------------------//
//                    create in bulk service                           //
//---------------------------------------------------------------------//

//un-implemented
export const BulkCreateApartments_Service = async () => {
  console.log("Bulk create apartments service called");
};

//---------------------------------------------------------------------//
//             get Apartments by Society service                        //
//---------------------------------------------------------------------//

export const getApartmentsBySociety_Service = async (
  input: getApartmentsBySocietyServiceInput,
) => {
  const { clerkUserId, cursor: rawCursor } = input;

  const actor = await resolveCurrentUser_Service({ clerkUserId });

  if (actor.authority.role !== "admin") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only admin is allowed to fetch apartments.",
      { clerkUserId }
    );
  };

  const cursor =
    typeof rawCursor === "string" && rawCursor.trim() !== ""
      ? rawCursor
      : undefined;

  const societyId = actor.scope.society.id;

  const apartments = await apartmentRepository.findApartmentsBySocietyId({
    societyId,
    cursor,
  });

  return apartments;
};

//un-implemented
export const GetApartmentDetails_Service = async () => {
  console.log("Get apartment details service called");
};

//un-implemented
export const UpdateApartment_Service = async () => {
  console.log("Update apartment service called");
};

//un-implemented
export const DeleteApartment_Service = async () => {
  console.log("Delete apartment service called");
};
