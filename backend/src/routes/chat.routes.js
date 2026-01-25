import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  groupMembers,
  createChat,
  lockChat,
  unlockChat,
  isChatLocked,
  search,
  updateAvatar,
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 150, // max 150 req/min per user/IP
});

router.post("/create", verifyJWT, rateLimiter, createChat);
router.get("/search", verifyJWT, rateLimiter, search);
router.get("/members/:chatId", verifyJWT, groupMembers);
router.post(
  "/avatar/:chatId",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar,
);
router.post("/lock/:chatId", verifyJWT, lockChat);
router.post("/unlock/:chatId", verifyJWT, unlockChat);
router.get("/isLocked/:chatId", verifyJWT, isChatLocked);

export { router as chatRouter };
