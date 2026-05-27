import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import {
  createUser_Controller,
  getCurrentUser_Controllers,
  inviteUser_Controller,
  assignUserToApartment_Controller,
} from "@/controllers/UserControllers/User.controller.js";

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
router.post("/create", createUser_Controller);

// PATCH /api/users/:userId/deactivate (admin)
// router.patch("/:userId/deactivate", deactivateUserController);

export { router as userRouter };