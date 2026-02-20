import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import { getCurrentUser_Controller } from "@/controllers/UserControllers/GetUser.controller.js";

const router: Router = Router(); 

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({ message: "User router is working!" });
});

// Apply authentication middleware to all routes in this router
router.use(clerkMiddleware()); 

// GET /api/users/me
router.get("/me", getCurrentUser_Controller);

/** 
 // This route is moved to ./system/system.routes.ts 
 // Read report on them in /readme dir
 // POST /api/users/bootstrap
 router.post("/bootstrap", bootstrapUser_Controller);
 */

// GET /api/users (admin)
// router.get("/", listUsersController);

// POST /api/users (admin)
// router.post("/", createUserController);

// PATCH /api/users/:userId/deactivate (admin)
// router.patch("/:userId/deactivate", deactivateUserController);

export default router; 