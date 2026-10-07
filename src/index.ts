import { bootstrapEnv } from './config/env.bootstarp.js';

bootstrapEnv();

import { connectDB } from './db/connectDB.js';
const {app} = await import('./app.js');

const PORT: number = process.env.PORT
  ? Number(process.env.PORT)
  : 8000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, (): void => {
      console.log(`Server is running on port ${PORT}`)
    })
    
    server.on("error", (error: Error): void => {
      console.error("SERVER ERROR:", error);
      process.exit(1);
    });
  })
  .catch((error: Error): void => {
    console.error("MONGODB CONNECTION FAILED:", error);
    process.exit(1);
  })