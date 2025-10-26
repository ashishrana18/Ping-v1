import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenerators.js";

export const verifyJWT = async (req, res, next) => {
  // 1) Grab tokens
  const header = req.headers.authorization;
  let accessToken = header?.startsWith("Bearer ")
    ? header.split(" ")[1]
    : req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  // 2) Try verify access token first
  if (accessToken) {
    try {
      req.user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      return next();
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return next(new ApiError(403, "Invalid access token"));
      }
      // expired → fall through to refresh
    }
  }

  // 3) No valid access token → try refresh
  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // (Optional) verify refreshToken against DB here

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshToken(decodedRefresh.userId);

      const isProd = process.env.NODE_ENV === "production";

      const accessTokenOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      };
      const refreshTokenOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
      };

      res
        .cookie("accessToken", newAccessToken, accessTokenOptions)
        .cookie("refreshToken", newRefreshToken, refreshTokenOptions);

      req.user = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET);
      return next();
    } catch (refreshErr) {
      console.log("Refresh token error:", refreshErr);
      return next(new ApiError(403, "Invalid or expired refresh token"));
    }
  }

  // 4) Neither token worked
  return next(new ApiError(401, "Authentication required"));
};
