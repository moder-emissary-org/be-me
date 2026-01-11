import fs from "fs";
import path from "path";
import dotenv from "dotenv";

let injected = false;

export const bootstrapEnv = (): void => {
  if (injected) return;

  const isProd = process.env.NODE_ENV === "production";
  const envPath = path.resolve(process.cwd(), ".env");

  if (!isProd) {
    if (!fs.existsSync(envPath)) {
      throw new Error(".env file is missing in non-production environment");
    }

    dotenv.config({
      path: envPath,
      override: false,
    });
  }

  injected = true;
};
