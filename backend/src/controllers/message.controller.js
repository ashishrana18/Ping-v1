// message.controller.js
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const prisma = new PrismaClient();

const createMessage = async ({ text, senderId, chatId }) => {
  console.log("Creating message:", { text, senderId, chatId });
  try {
    const savedMessage = await prisma.message.create({
      data: { text, senderId, chatId }
    });
    return savedMessage;
  } catch (error) {
    console.error("Error in createMessage:", error);
    throw error;
  }
};

const getMessagesByChat = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log("Fetching messages for chat:", chatId);
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const formatted = messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      chatId: msg.chatId,
      senderId: msg.senderId,
      senderName: msg.sender.username,
      senderAvatar: msg.sender.avatar,
      reads: messages.reads,
      sentAt: msg.createdAt
    }));

    return res.status(200).json(new ApiResponse(200, formatted));
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new ApiError(500, "Error fetching messages");
  }
});

const markMessageRead = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { messageId } = req.params;

  console.log("📝 markMessageRead called with:", { userId, messageId });

  if (!userId) {
    throw new ApiError(401, "Not authenticated");
  }
  if (!messageId) {
    throw new ApiError(400, "messageId is required");
  }

  try {
    const read = await prisma.messageRead.upsert({
      where: {
        // this must match your @@id([messageId, userId]) in schema
        messageId_userId: { messageId, userId }
      },
      update: { readAt: new Date() },
      create: { messageId, userId }
    });

    // fetch chatId so we can broadcast
    const msg = await prisma.message.findUnique({
      where: { id: messageId },
      select: { chatId: true }
    });
    if (!msg) {
      throw new ApiError(404, "Message not found");
    }

    const io = req.app.get("io");
    if (!io) throw new ApiError(500, "Socket.IO not initialized");
    io.to(msg.chatId).emit("messageRead", { messageId, userId });

    return res.json(new ApiResponse(200, read, "Message marked as read"));
  } catch (e) {
    console.error("❌ markMessageRead error:", e);
    // if it's a known Prisma error you could inspect e.code here
    throw new ApiError(500, "Could not mark message as read");
  }
});

// 2️⃣ Fetch all reads for this chat & this user
const getReadMessages = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { chatId } = req.params;

  const reads = await prisma.messageRead.findMany({
    where: {
      userId,
      message: {
        chatId: chatId
      }
    },
    orderBy: {
      readAt: "asc"
    },
    select: { messageId: true }
  });

  // DEBUG: make sure these match what you expect
  console.log("getReadMessages →", { userId, chatId, reads });

  const messageIds = reads.map((r) => r.messageId);
  return res
    .status(200)
    .json(new ApiResponse(200, messageIds, "Read messages"));
});

export { createMessage, getMessagesByChat, markMessageRead, getReadMessages };
