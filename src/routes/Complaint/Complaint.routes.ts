import { createComplaint_Controllers, deleteComplaint_Controllers, getComplaint_Controllers, listComplaints_Controllers, updateComplaintStatus_Controllers } from "@/controllers/ComplaintControllers/Complaint.controllers.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 
router.get("/test", (req, res) => {
  res.json({message: "Complaint router is working!"}); 
}); 
router.use(clerkMiddleware());
// resident + admin
router.post("/create", createComplaint_Controllers); 
router.get("/get", getComplaint_Controllers); 

// admin
router.patch("/:complaintId/status", updateComplaintStatus_Controllers);
router.get("/", listComplaints_Controllers); 
router.delete("/:id/delete", deleteComplaint_Controllers); 

export {router as complaintRouter}