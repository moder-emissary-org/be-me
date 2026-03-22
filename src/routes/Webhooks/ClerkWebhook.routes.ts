import { Router } from "express";
import { clerkWebhook_Controller } from "@/controllers/WebhookControllers/ClerkWebhook.controller.js";

const router: Router = Router();

router.get("/test", (req, res) => {
    res.json({ message: "Clerk Webhook router is working!" });
});

router.post("/persist-user-through-webhook", clerkWebhook_Controller);

export { router as clerkWebhookRouter };
