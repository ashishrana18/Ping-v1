import bcrypt from "bcryptjs";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { client } from "../redis/redis.js";

const create = asyncHandler(async (req, res) => {
  const { userId, chatId, msg } = req.body;

  const hashedMessage = await bcrypt.hash(msg, 10);

  const message = await client.zAdd(`secret:${chatId}`, {
    score: Math.floor(Date.now()),
    value: `${userId}:${hashedMessage}:${Date.now()}`
  });
  if (!message) {
    throw new ApiError(400, "Redis error!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message saved successfully in redis"));
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "ChatId is required!");
  }

  const messages = await client.zRangeByScore(
    `secret:${chatId}`,
    Math.floor(Date.now()) - 300000,
    "+inf"
  );

  const allMessages = messages.map((message) => message.split(":"));
  //   allMessages=allMessages.map

  if (!allMessages) {
    throw new ApiError(404, "Redis Error!");
  }

  return res.status(200).json(new ApiResponse(200, allMessages));
});

const removeExpiredMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  //use http long polling, to send req ar this url in every 10s, to constantly remove
  // msgs older than 5msgs.

  if (!chatId) {
    throw new ApiError(400, "ChatId is required!");
  }

  await client.zRemRangeByScore(
    `secret:${chatId}`,
    "-inf",
    Math.floor(Date.now() - 300000)
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Messages deleted Successfully!"));
});

export { create, getMessages, removeExpiredMessages };
