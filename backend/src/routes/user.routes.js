import { Router } from "express";
import {
  getUserProfile,
  searchUsers,
  getAllChats,
  isOnline
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();
router.get("/profile", verifyJWT, getUserProfile);
router.get("/search", verifyJWT, searchUsers);
router.get("/allChats", verifyJWT, getAllChats);
router.get("/online/:userId", verifyJWT, isOnline);

export { router as userRouter };
