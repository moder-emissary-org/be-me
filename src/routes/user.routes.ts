import { getUser } from "@/controllers/UserControllers/GetUser.controller.js";
import { RegisterUserController } from "@/controllers/UserControllers/RegisterUser.controller.js";
import { requireAuth } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 

router.route("/login").get(getUser); // test route to get user info
router.route("/register-user").post(RegisterUserController);
// router.route("/register-society").post(RegisterUserController);
// router.route("/all-user").get(getAllUsers);

export default router; 