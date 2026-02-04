import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient, getAuth } from "@clerk/express";

export const getUser = asyncHandler( async(req, res) => {
  // That is how we get the userId only from the seesion object
  const { userId } = getAuth(req);

  // full user session object
  const auth = getAuth(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  console.log("Authenticated user ID:", auth);

  // Use Clerk's JS Backend SDK to get the user's User object
  const userObj = await clerkClient.users.getUser(userId);
  return res.json(userObj);
});