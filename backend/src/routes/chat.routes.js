import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  chatMembers,
  createChat,
  search
} from "../controllers/chat.controller.js";

const router = Router();
router.post("/create", verifyJWT, createChat);
router.get("/search", verifyJWT, search);
router.get("/members", verifyJWT, chatMembers);

export { router as chatRouter };
