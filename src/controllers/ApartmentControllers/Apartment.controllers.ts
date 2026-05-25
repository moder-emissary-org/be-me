import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { createApartment_Service, getApartmentsBySociety_Service } from "@/services/Apartment/Apartment.services.js";
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

export const getApartments_Controllers = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.actor!; 
  const cursor = req.query.cursor as string | undefined;
  const apartments = await getApartmentsBySociety_Service({ clerkUserId, cursor });

  return res.status(200).json({ message: "Apartments retrieved successfully.", apartments });

});

export const UpdateApartment_Controllers = asyncHandler(async (req, res) => {
  console.log("Update Apartment controllers hit!");
  // Implement logic to update apartment details based on request parameters and body
});

export const DeleteApartment_Controllers = asyncHandler(async (req, res) => {
  console.log("Delete Apartment controllers hit!");
  // Implement logic to delete an apartment based on request parameters
});

export const BulkCreateApartments_Controllers = asyncHandler(async (req, res) => {
  console.log("Bulk Create Apartments controllers hit!");
  // Implement logic to bulk create apartments based on request body, which may contain an array of apartment details
});