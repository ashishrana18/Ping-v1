import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
import { ApiError } from "./ApiError.js";

const prisma = new PrismaClient();

const generateAccessAndRefreshToken = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
  const refreshToken = jwt.sign(
    {
      userId: user.id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: refreshToken }
  });
  return { accessToken, refreshToken };
};

export { generateAccessAndRefreshToken };
