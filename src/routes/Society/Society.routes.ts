import { societyBootstrap_Controllers } from "@/controllers/societyControllers/SocietyBootstrap.controller.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router();

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({ message: "Society router is working!" });
});

router.use(clerkMiddleware())

router.post('/bootstrap', societyBootstrap_Controllers);

export { router as societyRouter };