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

const router = Router();
router.get("/profile", verifyJWT, getUserProfile);
router.get("/search", verifyJWT, searchUsers);
router.get("/allChats", verifyJWT, getAllChats);
router.get("/online/:userId", verifyJWT, isOnline);
router.post("/avatar", verifyJWT, upload.single("avatar"), updateAvatar);

export { router as userRouter };
