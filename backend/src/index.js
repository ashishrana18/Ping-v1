import { createServer } from "http";
import app from "./app.js";
import dotenv from "dotenv";
import { setupSocket } from "./webSockets/socket.js";

dotenv.config({ path: "./.env" });

const server = createServer(app);

const io = setupSocket(server);
app.set("io", io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
});
