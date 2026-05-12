import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { createVisitor_Service, getPendingVisitorsForResident_Service, updateVisitorApprovalStatus_Service } from "@/services/Visitors/Visitors.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";
import { Types } from "mongoose";

export const createVisitor_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to create Visitor, No clerkUserId Found"
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

export const updateVisitorApprovalStatus_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to bootstarp Society, No clerkUserId Found"
    )
  };
  const { approvalStatus } = req.body;
  const rawVisitorId = req.params.visitorId;
  const visitorId = new Types.ObjectId(rawVisitorId); // change the string to objectID 

  if (visitorId === undefined || !Types.ObjectId.isValid(visitorId) || !visitorId) {
    throw new ControllerError(
      "BAD_REQUEST",
      "VisitorId is invalid!",
      { visitorId }
    );
  }

  await updateVisitorApprovalStatus_Service({
    clerkUserId,
    visitorId,
    approvalStatus,
  });

  res.status(200).json({
    message: "Visitor approval status updated successfully"
  });
});

export const getPendingVisitorsForResident_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to get pending visitors for resident, No clerkUserId Found"
    )
  };

  const rawCursor = req.query.cursor;
  const cursor =
    typeof rawCursor === "string"
      ? rawCursor
      : undefined;

  const limit = 10;

  const result = await getPendingVisitorsForResident_Service({
    clerkUserId,
    cursor,
    limit
  });

  res.status(200).json({
    message: "Pending visitors fetched successfully",
    data: result,
  });
});

export const checkInVisitor_Controllers = asyncHandler(async (req, res) => {
  console.log("Check In Visitor controller hit!");
  return res.status(200).json({ message: "Check In Visitor controller hit!" });
});

export const checkOutVisitor_Controllers = asyncHandler(async (req, res) => {
  console.log("Check Out Visitor controller hit!");
  return res.status(200).json({ message: "Check Out Visitor controller hit!" });
});

export const getVisitors_Controllers = asyncHandler(async (req, res) => {
  console.log("Get Visitors controller hit!");
  // Here you would typically call a service function to fetch visitors from the database
  // For example: const visitors = await getVisitors_Service();

  // For now, we'll just return a success message
  res.status(200).json({ message: "Visitors fetched successfully" });
});

export const deleteVisitor_Controllers = asyncHandler(async (req, res) => {
  console.log("Delete Visitor controller hit!");
  // Here you would typically call a service function to delete a visitor from the database
  // For example: await deleteVisitor_Service(req.params.id);

  // For now, we'll just return a success message
  res.status(200).json({ message: "Visitor deleted successfully" });
}); 