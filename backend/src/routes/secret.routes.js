import { Router } from "express";
import {
  create,
  getMessages,
  removeExpiredMessages
} from "../controllers/secretChat.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();
router.post("/create", verifyJWT, create);
router.get("/:chatId", verifyJWT, getMessages);
router.delete("/:chatId", verifyJWT, removeExpiredMessages);

export { router as secretRouter };
