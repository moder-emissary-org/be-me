import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { resolveCurrentUser_Service } from "@/services/User/resolveCurrentUserService.service.js";
import {
  inviteUser_Service,
  assignUserToApartment_Service,
} from "@/services/User/User.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient, getAuth } from "@clerk/express";

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
    .json(me);
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
  res.status(200).json(result);
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
  const { apartmentId } = req.body as { apartmentId: string };
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
  res.status(200).json({ success: true });
});

// Unused
export const loginUser_Controllers = (req: any, res: any) => {
  console.log("LoginUser controller is hit");
  res.status(200).json({ message: "LoginUser endpoint reached" });
};

// Unused
export const getAllUsers_Controllers = asyncHandler(async (req, res) => {
  const users = await clerkClient.users.getUserList();
  return res.json({ users });
});

// Unused
export const deleteUser_Controllers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }
  await clerkClient.users.deleteUser(userId);
  return res.json({ success: true, message: "User deleted successfully" });
});

// unused
export const createUser_Controller = asyncHandler(async (req, res) => {
  console.log("CreateUser controller is hit!");
  const { userId: ClerkUserId } = getAuth(req);
  if (!ClerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "No ClerkUserId found in the request. User must be authenticated."
    )
  }
  const { email, role, apartmentId } = req.body;
  console.log("createUser_Controller end with data: ", {});
  res.status(200).json({ message: "CreateUser endpoint reached" });
});
