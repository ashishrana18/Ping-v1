import { Router } from "express";
import {
  getUserProfile,
  searchUsers,
  getAllChats,
  isOnline,
  updateAvatar
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 30 // max 30 req/min per user/IP
});

router.get("/profile/:userId?", verifyJWT, rateLimiter, getUserProfile);
router.get("/search", verifyJWT, rateLimiter, searchUsers);
router.get("/allChats", verifyJWT, rateLimiter, getAllChats);
router.get("/online/:userId", verifyJWT, rateLimiter, isOnline);
router.post(
  "/avatar",
  verifyJWT,
  rateLimiter,
  upload.single("avatar"),
  updateAvatar
);

export { router as userRouter };
