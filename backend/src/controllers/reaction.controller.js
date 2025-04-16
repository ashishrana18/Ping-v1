// controllers/reaction.controller.js
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const prisma = new PrismaClient();

const createReaction = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const { messageId, userId } = req.params;
  const { reactionType } = req.body;

  if (!messageId || !userId || !reactionType) {
    throw new ApiError(400, "Missing required fields");
  }

  const existing = await prisma.reaction.findUnique({
    where: { messageId_userId: { messageId, userId } }
  });

  let reaction = null;
  let action;
  let chatId;

  if (!existing) {
    reaction = await prisma.reaction.create({
      data: {
        messageId,
        userId,
        emoji: reactionType
      },
      include: {
        message: { select: { chatId: true } }
      }
    });
    action = "added";
    chatId = reaction.message.chatId;
  } else if (existing.emoji === reactionType) {
    const msg = await prisma.message.findUnique({
      where: { id: messageId },
      select: { chatId: true }
    });
    if (!msg) throw new ApiError(404, "Message not found");
    chatId = msg.chatId;

    await prisma.reaction.delete({
      where: { messageId_userId: { messageId, userId } }
    });
    action = "removed";
  } else {
    reaction = await prisma.reaction.update({
      where: { messageId_userId: { messageId, userId } },
      data: { emoji: reactionType },
      include: {
        message: { select: { chatId: true } }
      }
    });
    action = "added";
    chatId = reaction.message.chatId;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatar: true }
  });

  const payload = {
    messageId,
    emoji: action === "removed" ? null : reaction.emoji,
    user,
    action
  };
  io.to(chatId).emit("reaction-updated", payload);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messageId, userId, emoji: payload.emoji },
        action === "added" ? "Saved" : "Removed"
      )
    );
});

export { createReaction };
