import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { ClerkIdentityProvider_Service } from "@/services/Identity/IdentityProvider.service.js";
import { bootstrapSociety_Service } from "@/services/Society/BootstrapSociety.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { resolveFullName } from "@/utils/utility.js";
import { getAuth } from "@clerk/express";

export const societyBootstrap_Controllers = asyncHandler(async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to bootstarp Society, No clerkUserId Found"
    )
  }

  const profile =
    await ClerkIdentityProvider_Service.getProfile(clerkUserId);

  const fullName = resolveFullName(profile.fullName, profile.email);
  const email = profile.email;
  
  const { name, address } = req.body;
  if (!name || !address) {
    throw new ControllerError(
      "BAD_REQUEST",
      "Name and address are required to bootstrap Society"
    )
  }

  const society = await bootstrapSociety_Service({
    name,
    address,
    clerkUserId,
    email,
    fullName,
  });
  if (!society) {
    throw new ControllerError(
      "FORBIDDEN",
      "Failed to bootstrap Society, Please try again later"
    )
  }

  res
    .status(201)
    .json({
      success: true,
      message: "Society bootstrapped successfully",
      data: society
    })
})
