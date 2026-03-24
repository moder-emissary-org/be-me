import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { ClerkIdentityProvider_Service } from "@/services/Identity/IdentityProvider.service.js";
import { bootstrapUser_Service } from "@/services/User/RegisterUser.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient, getAuth } from "@clerk/express";

// get the userId from the session obj using getAuth then 
// extract the user full object from clerk using clerkClient by providing the current userId
// extract email and full name from clerk user object
// call the RegisterUser service with proper inputs

export const bootstrapUser_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to bootstrap user, No clerkUserId Found"
    )
  }

  const { email, fullName } = await ClerkIdentityProvider_Service.getProfile(clerkUserId);
  if (!email || !fullName) {
    throw new ControllerError(
      "BAD_REQUEST",
      "Clerk user missing email or full name",
      { clerkUserId }
    )
  }

  const user = await bootstrapUser_Service({
    clerkUserId, 
    fullName,
    email,
    role: req.body.role,
    societyId: req.body.societyId,
    apartmentId: req.body.apartmentId,
    isActive: true,
  });

  return res.status(201).json({
    success: true,
    data: {
      id: user._id,
      role: user.role,
      societyId: user.societyId,
      apartmentId: user.apartmentId,
    },
  });
});

