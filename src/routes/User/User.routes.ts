import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import {
  getCurrentUser_Controllers,
  inviteUser_Controller,
  assignUserToApartment_Controller,
  getUsersBySociety_Controllers,
} from "@/controllers/UserControllers/User.controller.js";
import { requireAuthActor } from "@/middleware/RequireAuthActor.middleare.js";

const router: Router = Router();
router.get("/test", (req, res) => {
  res.json({ message: "User router is working!" });
});

router.use(clerkMiddleware());

router.get("/me", getCurrentUser_Controllers);

// (admin) – Clerk invitation
router.post("/invite", inviteUser_Controller);

// (admin) – membership
router.patch("/:userId/assign-apartment", assignUserToApartment_Controller);

// POST /api/users (admin)
router.get("/",requireAuthActor, getUsersBySociety_Controllers);

// PATCH /api/users/:userId/deactivate (admin)
// router.patch("/:userId/deactivate", deactivateUserController);

export { router as userRouter };