import mongoose from "mongoose";
import { env } from "process";

export const systemHealthCheckService = () => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return {
  status: isDbConnected ? "ok" : "unhealthy",
  service: "gate-g-backend",
  version: env.APP_VERSION,
  environment: env.NODE_ENV,
  db: {
    status: isDbConnected ? "connected" : "disconnected",
  },
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
};
}