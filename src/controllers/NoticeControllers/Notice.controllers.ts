import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { createNotice_Service } from "@/services/Notices/Notices.service.js";
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

export const getNotice_Controllers = asyncHandler( async(req, res) => {
  console.log("Get Notice controller hit!");
  // Here you would typically call a service function to retrieve notice details based on request parameters
  // For example: const notice = await getNotice_Service(req.params.id);
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Notice details retrieved successfully" });
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

export const listNotices_Controllers = asyncHandler( async(req, res) => {
  console.log("List Notices controller hit!");
  // Here you would typically call a service function to list notices, possibly with pagination and filtering based on query parameters
  // For example: const notices = await listNotices_Service(req.query);
  
  // For now, we'll just return a success message
  res.status(200).json({ message: "Notices listed successfully" }); 
});