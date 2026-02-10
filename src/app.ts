import express from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import userRouter  from "@/routes/User/User.routes.js";

const app: express.Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Apply middleware to all routes
app.use(clerkMiddleware());
app.use(requireAuth());

// Body parsers
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));

// Routes
app.use("/api/users", userRouter);
// app.use("/api/societies", societyRouter);
// app.use("/api/apartments", apartmentRouter);
// app.use("/api/visitors", visitorRouter);
// app.use("/api/complaints", complaintRouter);
// app.use("/api/notices", noticeRouter);

export { app };