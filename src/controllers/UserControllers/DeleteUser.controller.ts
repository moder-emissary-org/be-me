import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient } from "@clerk/express";

export const deleteUser = asyncHandler( async(req, res) => {
  const { userId } = req.params;

   if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  // Use Clerk's JS Backend SDK to delete the user by their `userId`
  await clerkClient.users.deleteUser(userId);
  return res.json({ success: true, message: "User deleted successfully" });
});