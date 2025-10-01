import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter.js";
import {
  loginUser,
  logoutUser,
  registerUser
} from "../controllers/user.controller.js";

const router = Router();
const rateLimiter = slidingWindowRateLimiter({
  windowSizeInSeconds: 60, // 1 minute
  maxRequests: 10 // max 10 login attempts per minute (prevent brute force)
});

// Register Route
router.post("/register", registerUser);
router.post("/login", rateLimiter, loginUser);

//verified routes
router.get("/logout", verifyJWT, rateLimiter, logoutUser);

export { router as authRouter };
