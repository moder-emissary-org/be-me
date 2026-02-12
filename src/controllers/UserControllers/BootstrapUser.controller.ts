import { RegisterUser_Service } from "@/Services/User/RegisterUser.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { clerkClient, getAuth } from "@clerk/express";

// get the userId from the session obj using getAuth then 
// extract the user full object from clerk using clerkClient by providing the current userId
// extract email and full name from clerk user object
// call the RegisterUser service with proper inputs

export const bootstrapUser_Controller = asyncHandler(async (req, res) => {
  console.log("Bootstrap User Controller Hit!");

  const { userId: clerkUserId } = getAuth(req);
  console.log("Authenticated clerkUserId from session:", clerkUserId);
  
  if (!clerkUserId) {
    return res.status(401).json({ error: "Unauthorized: No userId in session" });
  }

  const userObj = await clerkClient.users.getUser(clerkUserId);

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
    return res.status(400).json({ error: "Clerk user missing email or full name" });
  }

  const user = await RegisterUser_Service({
    clerkUserId, 
    fullName,
    email,
    role: req.body.role,
    societyId: req.body.societyId,
    apartmentId: req.body.apartmentId,
    isActive: true,
  });

  console.log("And of controller & Bootstraped User:", user);
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

