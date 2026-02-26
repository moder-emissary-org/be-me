import { createComplaint_Controllers, deleteComplaint_Controllers, getComplaint_Controllers, listComplaints_Controllers, updateComplaint_Controllers } from "@/controllers/ComplaintControllers/Complaint.controllers.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 
router.get("/test", (req, res) => {
  res.json({message: "Complaint router is working!"}); 
}); 
router.use(clerkMiddleware());
router.post("/create", createComplaint_Controllers); 
router.patch("/update", updateComplaint_Controllers)
router.get("/get", getComplaint_Controllers); 
router.get("/get-all-complaint", listComplaints_Controllers); 
router.delete("/delete/:id", deleteComplaint_Controllers); 

export {router as complaintRouter}