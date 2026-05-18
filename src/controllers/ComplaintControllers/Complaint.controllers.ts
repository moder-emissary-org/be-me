import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import {
  createComplaint_Service,
  getComplaints_Service,
  updateComplaintStatus_Service,
} from "@/services/Complaints/Complaints.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";

export const createComplaint_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to create a complaint: no authenticated user"
    );
  }

  const { title, description, category } = req.body;

  const result = await createComplaint_Service({
    clerkUserId,
    title,
    description,
    category,
  });

  res.status(201).json({
    message: "Complaint created successfully",
    data: result,
  });
});

export const getComplaint_Controllers = asyncHandler(async (req, res) => {
  console.log("Get Complaint controller hit!");
  // Here you would typically call a service function to retrieve complaint details based on request parameters
  // For example: const complaint = await getComplaint_Service(req.params.id);

  // For now, we'll just return a success message
  res.status(200).json({ message: "Complaint details retrieved successfully" });
});

export const updateComplaintStatus_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to update complaint status: no authenticated user"
    );
  }

  const { complaintId } = req.params;
  if (!complaintId) {
    throw new ControllerError("BAD_REQUEST", "Complaint ID is required");
  }

  const { status, adminRemark } = req.body;

  const result = await updateComplaintStatus_Service({
    clerkUserId,
    complaintId,
    status,
    adminRemark,
  });

  res.status(200).json({
    message: "Complaint status updated successfully",
    data: result,
  });
});

export const deleteComplaint_Controllers = asyncHandler(async (req, res) => {
  console.log("Delete Complaint controller hit!");
  // Here you would typically call a service function to delete a complaint based on request parameters
  // For example: await deleteComplaint_Service(req.params.id);

  // For now, we'll just return a success message
  res.status(200).json({ message: "Complaint deleted successfully" });
});

export const getComplaints_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to get all complaints: no authenticated user"
    );
  }

  const result = await getComplaints_Service({clerkUserId}); 
  res.status(200).json({ message: "Complaints listed successfully", data: result });
});
