import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  chatMembers,
  createChat,
  search,
  updateAvatar
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();
router.post("/create", verifyJWT, createChat);
router.get("/search", verifyJWT, search);
router.get("/members", verifyJWT, chatMembers);
router.post(
  "/avatar/:chatId",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);

export { router as chatRouter };
