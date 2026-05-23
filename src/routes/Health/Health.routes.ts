import { Router } from "express";
import mongoose from "mongoose";

const router: Router = Router();

router.get("/", (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    return res.status(503).json({
      status: "unhealthy",
      db: "disconnected",
    });
  }

  return res.status(200).json({
    status: "ok",
    db: "connected",
    uptime: process.uptime(),
  });
});

export { router as healthRouter };

// Read: { IMP } -- Health check endpoint explained on gpt. 
