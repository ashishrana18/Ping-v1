import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"],
  reconnection: true, // This is the default, but ensure it hasn't been disabled.
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
  // pingInterval: 10000, // 10 seconds
  // pingTimeout: 5000 // 5 seconds
});
socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});
socket.on("reconnect", (attempt) => {
  console.log("Socket reconnected on attempt:", attempt);
});

export default socket;
