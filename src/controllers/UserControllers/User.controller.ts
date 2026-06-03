import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { resolveCurrentUser_Service } from "@/services/User/resolveCurrentUserService.service.js";
import type { GetUsersFilters } from "@/services/User/Types/User.types.js";
import {
  inviteUser_Service,
  assignUserToApartment_Service,
  getUsersBySociety_Service,
  getUserDetails_Service,
} from "@/services/User/User.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { parseBooleanQuery, parseCursor, parseRoleQuery } from "@/utils/utility.js";
import { clerkClient, getAuth } from "@clerk/express";
import type { Types } from "mongoose";

export const getCurrentUser_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No userId in session" });
  }

  const me = await resolveCurrentUser_Service({ clerkUserId });

  return res
    .status(200)
    .json({
      message: "Current user retrieved successfully",
      data: me
    });
});

export const inviteUser_Controller = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "No Clerk user ID in request. User must be authenticated."
    );
  }

  const { email, role } = req.body as { email: string; role: "resident" | "guard" };
  const result = await inviteUser_Service({ email, role, invitedBy: clerkUserId });

  res.status(200).json({
    message: "User invited successfully",
    data: result
  });

});

export const assignUserToApartment_Controller = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "No Clerk user ID in request. User must be authenticated."
    );
  }

  const { userId } = req.params;
  const { apartmentId } = req.body as { apartmentId: Types.ObjectId };

  if (!userId || !apartmentId) {
    throw new ControllerError(
      "BAD_REQUEST",
      "userId and apartmentId are required."
    );
  }

  await assignUserToApartment_Service({
    userId,
    apartmentId,
    requestedBy: clerkUserId,
  });
  
  res.status(200).json({
    message: "User assigned to apartment successfully",
    data: { success: true }
  });
});

// TODO: implementation of own register and login systems. 

export const getUsersBySociety_Controllers = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.actor!;
  const cursor = parseCursor(req.query.cursor);
  const { search, role, isActive, apartmentAssigned } = req.query as GetUsersFilters;

  const filters: GetUsersFilters = {
    search: typeof search === "string" ? search : undefined,
    role: parseRoleQuery(role),
    isActive: parseBooleanQuery(isActive),
    apartmentAssigned: parseBooleanQuery(apartmentAssigned),
  };

  const result = await getUsersBySociety_Service({ clerkUserId, cursor, filters });

  return res.json({
    message: "Users retrieved successfully",
    data: result
  });
});

export const getUserDetails_Controller = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.actor!;

  const { userId: targetUserId } = req.params;
  if (!targetUserId) {
    throw new ControllerError(
      "BAD_REQUEST",
      "Incomplete request. userId is required."
    );
  }

  const userDetails = await getUserDetails_Service({ targetUserId, requestedBy: clerkUserId });
  if (!userDetails) {
    throw new ControllerError(
      "NOT_FOUND",
      "User details not found for the authenticated user."
    );
  }

  return res.json({
    message: "User details retrieved successfully",
    data: userDetails
  });
});

// Unused - not intend to be implement at MVP level. 
export const deleteUser_Controllers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }
  await clerkClient.users.deleteUser(userId);
  return res.json({ success: true, message: "User deleted successfully" });
});
