import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  chatMembers,
  createChat,
  search,
  updateAvatar,
  updateNickname
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 150 // max 150 req/min per user/IP
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
router.post("/nickname", verifyJWT, rateLimiter, updateNickname);

export { router as chatRouter };
