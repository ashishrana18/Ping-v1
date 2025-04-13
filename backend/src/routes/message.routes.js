// In your message.routes.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  getMessagesByChat,
  markMessageRead,
  getReadMessages
} from "../controllers/message.controller.js";
import { createReaction } from "../controllers/reaction.controller.js";

const router = Router();

// GET messages for a specific chat/room
router.get("/:chatId", verifyJWT, getMessagesByChat);
router.post("/:messageId/read", verifyJWT, markMessageRead);
router.get("/:chatId/reads", verifyJWT, getReadMessages);
router.post("/:messageId/:userId", verifyJWT, createReaction);

export { router as messageRouter };
