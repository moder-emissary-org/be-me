import { getVisitors_Controllers } from "@/controllers/VisitorsControllers/Visitor.controllers.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 
router.get("/test", (req, res) => {
  res.json({message: "Visitor router is working!"}); 
}); 
router.use(clerkMiddleware); 
router.get("/get", getVisitors_Controllers)

export { router as VisitorRouter } 