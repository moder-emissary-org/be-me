import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { createApartment_Service } from "@/services/Apartment/Apartment.services.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";

export const CreateApartment_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req); 
  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized: No authenticated user found." });
  }

  const { apartmentCode, towerLabel } = req.body;
  if (!apartmentCode || !towerLabel) {
    throw new ControllerError(
      "BAD_REQUEST",
      "Apartment code and tower label are required.",
      { statusCode: 400 }
    )
  }

  const apartment = await createApartment_Service({
    apartmentCode,
    towerLabel,
    clerkUserId
  });
  if(!apartment) {
    throw new ControllerError(
      "INTERNAL_ERROR",
      "Failed to create apartment.",
      { statusCode: 500 }
    )
  }

  return res
    .status(201)
    .json({ message: "Apartment created successfully.", apartment }); 
}); 

export const GetApartment_Controllers = asyncHandler(async (req, res) => {
  console.log("Get Apartment controllers hit!");
  // Implement logic to retrieve apartment details based on request parameters
});

export const UpdateApartment_Controllers = asyncHandler(async (req, res) => {
  console.log("Update Apartment controllers hit!");
  // Implement logic to update apartment details based on request parameters and body
});

export const DeleteApartment_Controllers = asyncHandler(async (req, res) => {
  console.log("Delete Apartment controllers hit!");
  // Implement logic to delete an apartment based on request parameters
});

export const ListApartments_Controllers = asyncHandler(async (req, res) => {
  console.log("List Apartments controllers hit!");
  // Implement logic to list apartments, possibly with pagination and filtering based on query parameters
});

export const BulkCreateApartments_Controllers = asyncHandler(async (req, res) => {
  console.log("Bulk Create Apartments controllers hit!");
  // Implement logic to bulk create apartments based on request body, which may contain an array of apartment details
});