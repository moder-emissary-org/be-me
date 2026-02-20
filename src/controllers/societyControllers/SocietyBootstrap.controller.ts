import { ControllerError } from "@/Error/ControllerErrors/MainCatcher/ControllerError.js";
import { ClerkIdentity_Services } from "@/Services/Identity/ClerkIdentity.services.js";
import { bootstrapSocietyService } from "@/Services/System/BootstrapSociety.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";

export const societyBootstrap_Controller = asyncHandler(async (req, res) => {

  console.log("SocietyBootstrapController called with body:", req.body);

  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to bootstarp Society, No clerkUserId Found"
    )
  }

  const { email, fullName } = await ClerkIdentity_Services.getProfile(clerkUserId);
  
  console.log("Authenticated clerkUserId from society Bootstrap controller: ", clerkUserId);

  const { name, address } = req.body;

  if (!name || !address) {
    throw new ControllerError(
      "BAD_REQUEST",
      "Name and address are required to bootstrap Society"
    )
  }

  const society = await bootstrapSocietyService({
    name, 
    address,
    clerkUserId, 
    email, 
    fullName
  }); 

  if (!society) {
    throw new ControllerError(
      "FORBIDDEN",
      "Failed to bootstrap Society, Please try again later"
    )
  }

  res.status(201).json({
    success: true,
    message: "Society bootstrapped successfully",
    data: society
  })
})