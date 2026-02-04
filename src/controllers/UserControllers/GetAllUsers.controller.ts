import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient } from "@clerk/express";

// example of an admin-only controller
export const getAllUsers = asyncHandler( async(req, res) => {
  // Use Clerk's JS Backend SDK to get all users
  const users = await clerkClient.users.getUserList();
  return res.json({ users });
});