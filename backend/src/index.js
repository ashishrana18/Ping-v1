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
