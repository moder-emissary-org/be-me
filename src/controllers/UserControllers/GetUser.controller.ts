import { resolveCurrentUser_Service } from "@/Services/User/resolveCurrentUserService.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";

export const getCurrentUser_Controller = asyncHandler( async(req, res) => {
  const { userId: clerkUserId } = getAuth(req);

  console.log("Get Current User Controller hit. Clerk User ID from session: ", clerkUserId);

  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized: No userId in session" });
  }

  const me = await resolveCurrentUser_Service({clerkUserId});

  return res.status(200).json(me);
});

// console.log("Received request to get current user");
// // That is how we get the userId only from the seesion object
// const { userId } = getAuth(req);

// // full user session object
// const auth = getAuth(req);

// if (!userId) {
//   return res.status(401).json({ success: false, message: "Unauthorized" })
// }

// console.log("Authenticated user ID:", auth);

// // Use Clerk's JS Backend SDK to get the user's User object
// const userObj = await clerkClient.users.getUser(userId);
// return res
//   .status(200)
//   .json({ success: true, user: userObj });