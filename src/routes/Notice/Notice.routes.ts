import { createNotice_Controllers, deleteNotice_Controllers, getNotices_Controllers, updateNotice_Controllers } from "@/controllers/NoticeControllers/Notice.controllers.js";
import { requireAuthActor } from "@/middleware/RequireAuthActor.middleare.js";
import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";

const router: Router = Router(); 

router.get("/test", (req, res) => {
  res.json({message: "Notice router is working!"}); 
});

router.use(clerkMiddleware());

router.post("/create", createNotice_Controllers); 
router.patch("/update", updateNotice_Controllers); 

// test of custom middleware.
router.get("/",requireAuthActor, getNotices_Controllers); 
router.delete("/delete", deleteNotice_Controllers); 

export {router as noticeRouter}