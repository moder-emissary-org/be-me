import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { createVisitor_Service } from "@/services/Visitors/Visitors.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";

export const createVisitor_Controllers = asyncHandler( async(req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to bootstarp Society, No clerkUserId Found"
    )
  };
  const { name, purpose, contactNumber, apartmentId, expectedAt } = req.body;
  const result = await createVisitor_Service({
    clerkUserId,
    name,
    purpose,
    contactNumber,
    apartmentId,
    expectedAt,
  });
  res.status(201).json({
    message: "Visitor created successfully",
    data: result,
  });
});

export const getVisitors_Controllers = asyncHandler( async(req, res) => {
  console.log("Get Visitors controller hit!");
  // Here you would typically call a service function to fetch visitors from the database
  // For example: const visitors = await getVisitors_Service();
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Visitors fetched successfully" });
}); 

export const updateVisitor_Controllers = asyncHandler( async(req, res) => {
  console.log("Update Visitor controller hit!");
  // Here you would typically call a service function to update a visitor's information in the database
  // For example: const updatedVisitor = await updateVisitor_Service(req.params.id, req.body);
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Visitor updated successfully" });
});

export const deleteVisitor_Controllers = asyncHandler( async(req, res) => {
  console.log("Delete Visitor controller hit!");
  // Here you would typically call a service function to delete a visitor from the database
  // For example: await deleteVisitor_Service(req.params.id);
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Visitor deleted successfully" });
}); 