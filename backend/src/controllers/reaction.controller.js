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

  // 1️⃣ See if there’s already a reaction
  const existing = await prisma.reaction.findUnique({
    where: { messageId_userId: { messageId, userId } }
  });

  let reaction = null;
  let action;
  let chatId;

  if (!existing) {
    // 2️⃣ No existing → create
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
    // 3️⃣ Same emoji clicked again → delete
    // we need chatId before we delete
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
    // 4️⃣ Different emoji → update
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

  // 5️⃣ Fetch user info for broadcast
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatar: true }
  });

  // 6️⃣ Build payload & emit
  const payload = {
    messageId,
    emoji: action === "removed" ? null : reaction.emoji,
    user,
    action
  };
  io.to(chatId).emit("reaction-updated", payload);

  // 7️⃣ Respond
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
