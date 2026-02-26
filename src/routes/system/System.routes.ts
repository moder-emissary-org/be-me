import { systemBootstrap_Controllers } from "@/controllers/SystemController/SystemBootstrap.controller.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({ message: "System router is working!" });
});

router.use(clerkMiddleware()); 

router.post('/bootstrap', systemBootstrap_Controllers); 

export { router as systemRouter };