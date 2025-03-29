// In your message.routes.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { getMessagesByChat } from "../controllers/message.controller.js";

const router = Router();

// GET messages for a specific chat/room
router.get("/:chatId", verifyJWT, getMessagesByChat);

export { router as messageRouter };
