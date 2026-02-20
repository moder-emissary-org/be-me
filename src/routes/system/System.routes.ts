import { systemBootstrap_Controller } from "@/controllers/SystemController/SystemBootstrap.controller.js";
import { Router } from "express";

const router: Router = Router(); 

router.post('/bootstrap', systemBootstrap_Controller); 

export default router; 