import { getUser } from "@/controllers/user.controllers.js";
import { Router } from "express";

const router: Router = Router(); 

router.route("/user").get(getUser)

export default router; 