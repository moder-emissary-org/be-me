import { ControllerError } from "@/error/ControllerErrors/MainCatcher/ControllerError.js";
import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export const requireAuthActor = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {

  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) {
    throw new ControllerError(
      "UNAUTHORIZED",
      "Authentication required"
    );
  }

  req.actor = {
    clerkUserId
  };

  next();
}