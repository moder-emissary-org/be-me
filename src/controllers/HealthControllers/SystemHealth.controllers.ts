import { systemHealthCheckService } from "@/services/health/health.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const getSystemHealth = asyncHandler(async (req, res) => {
  const health = systemHealthCheckService();
  res
    .status(health.status === "ok" ? 200 : 503)
    .json(health);
})