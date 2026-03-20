import { ServiceError } from "@/Error/ServicesErrors/MainCatcher/ServiceError.js"
import { ApartmentRepository_Repository } from "@/Repository/ApartmentRepository/Apartment.repository.js"
import { FindApartment_Repository } from "@/Repository/ApartmentRepository/FindApartment.repository.js"
import { findUserByID_Repository } from "@/Repository/userRepository/FindUser.repository.js"
import { isMongoDuplicateError } from "@/utils/MongoErrors.utils.js"
import type { Types } from "mongoose"

interface CreateApartmentInput {
  apartmentCode: string
  towerLabel: string
  clerkUserId: string   // from controller, not body, imp for admin verification and society association
}

interface CreateApartmentOutput {
  apartmentCode: string
  towerLabel?: string | null
  societyId: Types.ObjectId
  createdAt: Date
}

export const createApartment_Service = async (input: CreateApartmentInput): Promise<CreateApartmentOutput> => {
  console.log("Create apartment service called with input: ", input);

  const adminUser = await findUserByID_Repository.findByClerkUserId(input.clerkUserId);

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
    await FindApartment_Repository.findBySocietyIdAndApartmentCode(adminSocietyId, input.apartmentCode);

  if (existingApartment) {
    throw new ServiceError(
      "DUPLICATE_APARTMENT_FOUND",
      "An apartment with the same code already exists in this society.",
      { statusCode: 409, societyId: adminSocietyId, apartmentCode: input.apartmentCode }
    );
  }

  console.log("apartmentRepsitory hit with adminSocietyId: ", adminSocietyId);
 
  const normalizedApartmentCode = input.apartmentCode.trim().toUpperCase();

  console.log("Normalized apartment code: ", normalizedApartmentCode);

  try {
    const apartment = await ApartmentRepository_Repository.create({
      apartmentCode: normalizedApartmentCode,
      towerLabel: input.towerLabel ?? undefined,
      societyId: adminSocietyId,
    });

    console.log("Apartment created successfully from service:", apartment);
    return {
      apartmentCode: apartment.apartmentCode,
      towerLabel: apartment.towerLabel ? apartment.towerLabel : null,
      societyId: apartment.societyId,
      createdAt: apartment.createdAt
    }
  } catch (error: any) {
    if (isMongoDuplicateError(error)) {
      throw new ServiceError(
        "DUPLICATE_APARTMENT_FOUND",
        `Apartment '${normalizedApartmentCode}' already exists in this society.`,
        { statusCode: 409 }
      );
    }

    throw new ServiceError(
      "OPERATION_FAILED",
      "Unexpected error while creating apartment.",
      { statusCode: 500 }
    );
  }
};

export const BulkCreateApartments_Service = async () => {
  console.log("Bulk create apartments service called")
}

export const ListApartments_Service = async () => {
  console.log("List apartments service called")
}

export const GetApartmentDetails_Service = async () => {
  console.log("Get apartment details service called")
}

export const UpdateApartment_Service = async () => {
  console.log("Update apartment service called")
}

export const DeleteApartment_Service = async () => {
  console.log("Delete apartment service called")
} 