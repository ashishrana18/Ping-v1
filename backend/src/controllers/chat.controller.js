import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";
import { deleteCloudinary, uploadCloudinary } from "../utils/cloudinary.js";

const prisma = new PrismaClient();

const createChat = asyncHandler(async (req, res) => {
  const { chatId, isGroup, members, name } = req.body;
  let newChat = null;

  if (chatId) {
    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true }
    });
    if (existingChat) {
      return res
        .status(200)
        .json(new ApiResponse(200, existingChat, "Chat already exists"));
    }
  }

  if (!isGroup) {
    newChat = await prisma.chat.create({
      data: { id: chatId, isGroup: false }
    });

    await prisma.chatMember.createMany({
      data: [
        { userId: members[0], chatId: chatId },
        { userId: members[1], chatId: chatId }
      ]
    });
  } else {
    console.log("inside group creation");
    newChat = await prisma.chat.create({
      data: {
        name: name,
        isGroup: true,
        avatar:
          "https://png.pngtree.com/png-clipart/20190620/original/pngtree-vector-leader-of-group-icon-png-image_4022100.jpg"
      },
      include: {
        members: true
      }
    });

    if (newChat == null) {
      throw new ApiError(300, "Prisma error");
    }

    for (let i = 0; i < members.length; i++) {
      await prisma.chatMember.create({
        data: { userId: members[i], chatId: newChat.id }
      });
    }
  }

  return res.status(200).json(new ApiResponse(200, newChat));
});

const search = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json(new ApiError(400, "Query required"));
  }

  const groupsPromise = prisma.chat.findMany({
    where: {
      isGroup: true,
      name: { contains: query, mode: "insensitive" }
    },
    select: { id: true, name: true, avatar: true, isGroup: true }
  });

  let usersPromise = prisma.user.findMany({
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
    select: { id: true, username: true, email: true, avatar: true }
  });

  // this is just to make query faster, so userPromise call dont have to wait
  // for groupsPromise, they are independent to each other, and called simultaneously
  const [groups, users] = await Promise.all([groupsPromise, usersPromise]);

  return res.status(200).json(new ApiResponse(200, { groups, users }));
});

const chatMembers = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const members = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  return res.status(200).json(new ApiResponse(200, members));
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError("Avatar is required!");
  }

  const { chatId } = req.params;

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId
    }
  });

  if (!chat) {
    throw new ApiError(400, "Chat not found!");
  }

  const avatar = req.file?.path;
  const oldAvatar = chat.avatar;
  const cloudinaryURL = await uploadCloudinary(avatar);

  let url = null;

  if (oldAvatar !== null) {
    url = await deleteCloudinary(oldAvatar);
  }

  if (!cloudinaryURL) {
    throw new ApiError("Cloudinary error!");
  }

  const updatedChat = await prisma.chat.update({
    where: {
      id: chatId
    },
    data: {
      avatar: cloudinaryURL
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { updatedChat, url }, "done"));
});

export { createChat, search, chatMembers, updateAvatar };
