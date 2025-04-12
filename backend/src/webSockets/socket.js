// socketServer.js
import { Server } from "socket.io";
import { client } from "../redis/redis.js";
import { createMessage } from "../controllers/message.controller.js";
import { create } from "../controllers/secretChat.controller.js";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";

const prisma = new PrismaClient();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Explicit frontend URL
      methods: ["GET", "POST"],
      credentials: true
    }
    // pingInterval: 10000, // ← MATCH CLIENT
    // pingTimeout: 5000 // ← MATCH CLIENT
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", async (data) => {
      const { chatId } = data;
      console.log(
        `user is connected with another user, having chatId : ${chatId}`
      );
      socket.join(chatId);
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      const { chatId, text, senderId } = data;
      console.log("Sending message with:", { chatId, text, senderId });
      if (chatId && text && senderId) {
        try {
          const savedMessage = await createMessage({
            text,
            senderId,
            chatId // Ensure chatId corresponds to an existing chat
          });
          console.log("Message saved:", savedMessage);

          const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { username: true, avatar: true }
          });

          io.to(chatId).emit("receiveMessage", {
            id: savedMessage.id,
            text: savedMessage.text,
            senderId: savedMessage.senderId,
            senderName: sender.username,
            senderAvatar: sender.avatar,
            sentAt: savedMessage.createdAt
          });

          console.log("Message sent to chat:", chatId);
        } catch (error) {
          console.error(
            "Error saving message from socket",
            socket.id,
            ":",
            error
          );
          socket.emit("errorMessage", { error: "Message could not be saved" });
        }
      } else {
        console.log(`Invalid message data from socket ${socket.id}`);
      }
    });

    socket.on("userOnline", async (data) => {
      const { userId } = data;
      try {
        await client.set(`online:${userId}`, "true", { EX: 60 });
      } catch (error) {
        console.error(
          "Error while setting online status of user :",
          error.message
        );
      }
    });

    socket.on("typing", async (data) => {
      const { chatId, userId } = data;
      socket.to(chatId).emit("userTyping", { chatId, userId });
    });

    socket.on("stopTyping", ({ chatId, userId }) => {
      socket.to(chatId).emit("userStopTyping", { userId });
    });

    socket.on("sendSecretMessage", async (data) => {
      const { chatId, userId, msg } = data;
      try {
        await create({ userId, chatId, msg });
        io.to(chatId).emit("receiveSecretMessage", {
          userId,
          msg,
          timestamp: Date.now()
        });
        console.log("Secret message sent to room:", chatId);
      } catch (error) {
        console.error("Error handling sendSecretMessage:", error);
        socket.emit("errorSecretMessage", { error: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
