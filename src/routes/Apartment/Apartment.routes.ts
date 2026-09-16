import {
  CreateApartment_Controllers,
  DeleteApartment_Controllers,
  getApartments_Controllers,
  UpdateApartment_Controllers
} from "@/controllers/ApartmentControllers/Apartment.controllers.js";
import { requireAuthActor } from "@/middleware/RequireAuthActor.middleare.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router();
router.get("/test", (req, res) => {
  res.json({ message: "Apartment router is working!" });
});
router.use(clerkMiddleware());
router.post("/create", CreateApartment_Controllers);
router.post("/bulk-create", CreateApartment_Controllers);
router.patch("/update", UpdateApartment_Controllers);
router.get("/",requireAuthActor, getApartments_Controllers);
router.get("/delete", DeleteApartment_Controllers);

export { router as apartmentRouter };