import { createServer } from "http";
import app from "./app.js";
import dotenv from "dotenv";
import { setupSocket } from "./WebSockets/socket.js";

dotenv.config({ path: "./.env" });

const server = createServer(app);

setupSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
