import { CreateApartment_Controllers, DeleteApartment_Controllers, GetApartment_Controllers, ListApartments_Controllers, UpdateApartment_Controllers } from "@/controllers/ApartmentControllers/Apartment.controllers.js";
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
router.get("/get", GetApartment_Controllers);
router.get("/get-apartment-list", ListApartments_Controllers);
router.get("/delete", DeleteApartment_Controllers);

export { router as apartmentRouter };