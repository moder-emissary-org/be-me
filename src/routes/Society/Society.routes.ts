import { societyBootstrap_Controller } from "@/controllers/societyControllers/SocietyBootstrap.controller.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 

router.use(clerkMiddleware())

router.post('/bootstrap', societyBootstrap_Controller); 

export default router; 