/**
 *  ------------ ERROR RESOLVER MIDDLEWARE --------------
 * 
 *  Invariants:
 *    1. AppError → standardized response
 *    2. Unknown error → safe 500
 *    3. headers already sent → delegate to Express
 * 
 *  Description:
 *    Resolves application errors into the public HTTP error response.
 *
 *    Known AppError instances use their own resolved status code and
 *    semantic error data. Unknown errors fall back to a safe 500 response.
 *
 *    If the response has already started, responsibility is delegated
 *    to the next Express error handler.
 * 
 *  ------------------------------------------------------
*/

import { AppError } from "@/error/core/AppError/AppError.js";
import type { NextFunction, Request, Response } from "express";

export function serverErrorResolver(
  /** 
   *  'err: unknown' only this param shows that this is an error handling middleware, stated by express docs 
   *  normal middleware has signature similar to (req, res, next) => void
   *  that's why this asyncHandler (/src/utils/asyncHandler.ts) has only these params (req, res, next).
  */
  err: unknown, 
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  /** Do not attempt another response once HTTP headers have been sent. */ 
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    const isDevelopment =
      process.env.NODE_ENV === "dev";

    res.status(err.statusCode).json({
      success: false,
      error: {
        layer: err.layer,
        code: err.code,
        message: err.message,

        ...(isDevelopment && {
          context: err.context,
        }),
      },
    });

    return;
  }

  console.log("err: ", err);
  /** catches custom errors if not found instance of AppError */
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected system error occurred.",
    },
  });
}