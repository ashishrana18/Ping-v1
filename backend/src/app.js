import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocal = origin === "http://localhost:5173";
      const isVercel = origin?.endsWith(".vercel.app");

      if (!origin || isLocal || isVercel) {
        callback(null, true);
      } else {
        callback(new ApiError(403, "Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  }),
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

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.use("/api/user/", userRouter);
app.use("/api/auth/", authRouter);
app.use("/api/messages/", messageRouter);
app.use("/api/chat", chatRouter);
app.use("/api/secret", secretRouter);

app.use(errorHandler);

export default app;
