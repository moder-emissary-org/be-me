import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient, getAuth } from "@clerk/express";

export const getUser = asyncHandler( async(req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  // Use Clerk's JS Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId);
  return res.json({ user });

}) 