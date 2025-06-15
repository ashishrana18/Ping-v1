import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  chatMembers,
  createChat,
  search,
  updateAvatar
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 40 // max 10 req/min per user/IP
});

router.post("/create", verifyJWT, rateLimiter, createChat);
router.get("/search", verifyJWT, rateLimiter, search);
router.get("/members", verifyJWT, rateLimiter, chatMembers);
router.post(
  "/avatar/:chatId",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);

export { router as chatRouter };
