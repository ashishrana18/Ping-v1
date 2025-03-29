import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { client } from "../redis/redis.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenerators.js";

const prisma = new PrismaClient();
dotenv.config();

// Register Route
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists!");
  }

  try {
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword }
    });
    return res.status(201).json(new ApiResponse(201, user));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
});

// Login Route
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.status(400).json({ error: "Invalid password" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user.id
    );
    const loggedInUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        refreshToken: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }));
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  });

  await client.del(`online:${userId}`);

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "Logged out successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully fetched user profile"));
});

const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json(new ApiResponse(400, [], "Query required"));
  }

  let users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } }
          ]
        },
        { id: { not: req.user?.userId } }
      ]
    },
    select: { id: true, username: true, email: true }
  });
  res.status(200).json(new ApiResponse(200, users, "Users found"));
});

const getAllChats = asyncHandler(async (req, res) => {
  //chatgpt method
  const userWithChats = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    include: {
      chats: {
        include: {
          chat: {
            include: {
              members: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });

  const chats =
    userWithChats?.chats.map((chatMember) => {
      const chat = chatMember.chat;
      const otherMembers = chat.members.filter(
        (member) => member.userId !== req.user?.userId
      );
      return {
        chatId: chat.id,
        members: otherMembers.map((member) => member.user) // array of user objects
      };
    }) || [];

  //mine method
  const allChats = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    include: {
      chats: true
    }
  });

  const chatIdArray = allChats.chats.map((chat) => chat.chatId);
  let friends = [];

  for (let i = 0; i < chatIdArray.length; i++) {
    const chatId = chatIdArray[i];
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true }
    });

    const otherChatMembers = chat.members.filter(
      (member) => member.userId != req.user?.userId
    );

    for (let j = 0; j < otherChatMembers.length; j++) {
      const otherChatMember = otherChatMembers[j];
      const friend = await prisma.user.findUnique({
        where: { id: otherChatMember.userId }
      });
      if (friend) {
        friends.push({ chat, friend });
      }
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, friends, "Chats with friends found"));
});

const isOnline = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const onlineStatus = await client.get(`online:${userId}`);
  const isOnline = onlineStatus === "true";
  return res.status(200).json(isOnline);
});

export {
  registerUser,
  loginUser,
  logoutUser,
  searchUsers,
  getUserProfile,
  getAllChats,
  isOnline
};
