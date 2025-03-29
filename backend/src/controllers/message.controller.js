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
      where: {
        chatId
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    return res.status(200).json(new ApiResponse(200, messages));
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new ApiError(500, "Error fetching messages");
  }
});

export { createMessage, getMessagesByChat };
