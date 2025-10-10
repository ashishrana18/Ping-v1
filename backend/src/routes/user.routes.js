import { Router } from "express";
import {
  getUserProfile,
  searchUsers,
  getAllChats,
  isOnline,
  updateAvatar,
  updateUsername
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 200 // max 200 req/min per user/IP (chat apps need high limits)
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
router.post("/updateUsername", verifyJWT, updateUsername);

export { router as userRouter };
