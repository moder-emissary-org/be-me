import { 
  checkInVisitor_Controllers,
  checkOutVisitor_Controllers,
  createVisitor_Controllers, 
  getPendingVisitorsForResident_Controllers, 
  getVisitors_Controllers, 
  updateVisitorApprovalStatus_Controllers
 } from "@/controllers/VisitorsControllers/Visitor.controllers.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router();
router.get("/test", (req, res) => {
  res.json({ message: "Visitor router is working!" });
});

router.use(clerkMiddleware());

// Admin Scoped Routes
router.get("/", getVisitors_Controllers);

// Guard Scoped Routes
router.post("/create", createVisitor_Controllers);
router.post("/check-in", checkInVisitor_Controllers);
router.post("/check-out", checkOutVisitor_Controllers);

// Resident Scoped Routes
router.get("/pending", getPendingVisitorsForResident_Controllers);
router.patch("/:visitorId/approval", updateVisitorApprovalStatus_Controllers);

export { router as VisitorRouter } 