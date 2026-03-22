import express from "express";
import cors from "cors";
import { userRouter } from "@/routes/User/User.routes.js";
import { healthRouter } from "@/routes/Health/Health.routes.js";
import { societyRouter } from "@/routes/Society/Society.routes.js";
import { apartmentRouter } from "./routes/Apartment/Apartment.routes.js";
import { VisitorRouter } from "./routes/Visitor/visitor.routes.js";
import { complaintRouter } from "./routes/Complaint/Complaint.routes.js";
import { noticeRouter } from "./routes/Notice/Notice.routes.js";
import { clerkWebhookRouter } from "@/routes/Webhooks/ClerkWebhook.routes.js";

const app: express.Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Webhook route needs raw body for signature verification (must be before json parser)
app.use(
  "/api/v1/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhookRouter
);

// Body parsers
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));

// Health route 
app.use("/api/v1/healthcheck", healthRouter);

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/societies", societyRouter);
app.use("/api/v1/apartments", apartmentRouter);
app.use("/api/v1/visitors", VisitorRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/notices", noticeRouter);

export { app };