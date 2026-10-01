import { getSystemHealth } from "@/controllers/HealthControllers/SystemHealth.controllers.js";
import { Router } from "express";

const router: Router = Router();

router.get("/", getSystemHealth);

export { router as healthRouter };

// Read: { IMP } -- Health check endpoint explained on gpt. 
