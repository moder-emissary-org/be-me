import { createNotice_Controllers, deleteNotice_Controllers, getNotice_Controllers, listNotices_Controllers, updateNotice_Controllers } from "@/controllers/NoticeControllers/Notice.controllers.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 
router.get("/test", (req, res) => {
  res.json({message: "Notice router is working!"}); 
}); 
router.use(clerkMiddleware());
router.post("/create", createNotice_Controllers); 
router.patch("/update", updateNotice_Controllers); 
router.get("/get", getNotice_Controllers); 
router.get("/get-all-notices", listNotices_Controllers); 
router.delete("/delete", deleteNotice_Controllers); 
export {router as noticeRouter}