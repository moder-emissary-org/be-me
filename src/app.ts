import express from "express";
import cors from "cors";

const app: express.Application = express();

app.use(
   cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
   })
);

app.use("/api", (): void => {
    console.log("API route hit");
})

export { app };