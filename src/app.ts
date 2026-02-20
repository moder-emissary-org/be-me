import express from "express";
import cors from "cors";
import systemRouter from "@/routes/system/System.routes.js"
import userRouter  from "@/routes/User/User.routes.js";
import healthRouter from "@/routes/Health/Health.routes.js";
import societyRouter from "@/routes/Society/Society.routes.js";

const app: express.Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));

// Health route FIRST (before auth middleware)
app.use("/api/v1/healthcheck", healthRouter);

// Routes
app.use("/api/v1/system", systemRouter)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/societies", societyRouter);
// app.use("/api/v1/apartments", apartmentRouter);
// app.use("/api/v1/visitors", visitorRouter);
// app.use("/api/v1/complaints", complaintRouter);
// app.use("/api/v1/notices", noticeRouter);

export { app };