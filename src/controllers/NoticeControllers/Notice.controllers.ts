import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { createNotice_Service, getNotices_Service } from "@/services/Notices/Notices.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAuth } from "@clerk/express";

export const createNotice_Controllers = asyncHandler( async(req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Not authorized to create a complaint: no authenticated user"
    );
  }

  const {title, content} = req.body; 

  const result = await createNotice_Service({
    clerkUserId,
    title,
    content
  }); 

  res.status(201).json({ message: "Notice created successfully", data: result });
});

export const getNotices_Controllers = asyncHandler( async(req, res) => {
  // Herewe aare trying to test the custom middleware that adds req.actor with clerkUserId, so we will use that instead of calling getAuth again here. This is to ensure that our middleware is working as expected and req.actor is populated correctly.
  // const { userId: clerkUserId } = getAuth(req);
  // if (!clerkUserId) {
  //   throw new ControllerError(
  //     "UNAUTHORIZED",
  //     "Not authorized to create a complaint: no authenticated user"
  //   );
  // }

  const {clerkUserId} = req.actor!; // Using the clerkUserId from our custom middleware

  const cursor = req.query.cursor as string | undefined; 
  const results = await getNotices_Service({clerkUserId, cursor}); 
  res.status(200).json({ message: "Notice details retrieved successfully", data: results });
});

export const updateNotice_Controllers = asyncHandler( async(req, res) => {
  console.log("Update Notice controller hit!");
  // Here you would typically call a service function to update notice details based on request parameters and body
  // For example: const updatedNotice = await updateNotice_Service(req.params.id, req.body);
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Notice updated successfully" });
});

export const deleteNotice_Controllers = asyncHandler( async(req, res) => {
  console.log("Delete Notice controller hit!");
  // Here you would typically call a service function to delete a notice based on request parameters
  // For example: await deleteNotice_Service(req.params.id);
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Notice deleted successfully" });
});