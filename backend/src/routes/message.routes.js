// In your message.routes.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { getMessagesByChat } from "../controllers/message.controller.js";
import { createReaction } from "../controllers/reaction.controller.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 300 // max 300 req/min per user/IP (messages are fetched frequently)
});

// GET messages for a specific chat/room
router.get("/:chatId", verifyJWT, rateLimiter, getMessagesByChat);
router.post("/:messageId/:userId", verifyJWT, rateLimiter, createReaction);

export { router as messageRouter };
