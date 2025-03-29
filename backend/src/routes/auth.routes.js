import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  loginUser,
  logoutUser,
  registerUser
} from "../controllers/user.controller.js";

const router = Router();

// Register Route
router.post("/register", registerUser);
router.post("/login", loginUser);

//verified routes
router.get("/logout", verifyJWT, logoutUser);

export { router as authRouter };
