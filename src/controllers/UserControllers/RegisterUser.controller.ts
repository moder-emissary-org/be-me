import { RegisterUser_Service } from "@/Services/User/RegisterUser.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient, getAuth } from "@clerk/express";

// get the userId from the session obj using getAuth then 
// extract the user full object from clerk using clerkClient by providing the current userId
// extract email and full name from clerk user object
// call the RegisterUser service with proper inputs

export const RegisterUserController = asyncHandler(async (req, res) => {
  console.log("Register User Controller Hit");
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userObj = await clerkClient.users.getUser(userId);

  console.log("Clerk User Object:", userObj);

  // ensure clerk user exists
  if (!userObj) {
    return res.status(404).json({ error: "Clerk user not found" });
  }

  // extract email and full name from Clerk user object (be defensive)
  const email = 
    userObj.emailAddresses?.[0]?.emailAddress || 
    userObj.primaryEmailAddress?.emailAddress || 
    undefined;
    
  const fullName = 
    userObj.fullName || `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim();

  console.log("Extracted Email:", email);
  console.log("Extracted Full Name:", fullName);

  if (!email || !fullName) {
    return res.status(400).json({ error: "Clerk profile missing email or name" });
  }

  // CALL THE REGISTER USER SERVICE WITH PROPER INPUTS
  const user = await RegisterUser_Service({
    clerkUserId: userId,
    role: req.body.role,
    societyId: req.body.societyId,
    apartmentId: req.body.apartmentId,
    email,
    fullName,
  });

  console.log("Registered User:", user);
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

