import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import { userRouter } from "./routes/user.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { messageRouter } from "./routes/message.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { secretRouter } from "./routes/secret.routes.js";

app.use("/api/user/", userRouter);
app.use("/api/auth/", authRouter);
app.use("/api/messages/", messageRouter);
app.use("/api/chat", chatRouter);
app.use("/api/secret", secretRouter);

app.use(errorHandler);

export default app;
