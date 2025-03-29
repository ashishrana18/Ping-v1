import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenerators.js";

export const verifyJWT = async (req, res, next) => {
  let token;

  // Try to get the access token from the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new ApiError(401, "Access token not provided"));
  }

  try {
    // Try verifying the access token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    // If the error is due to expiration, try verifying the refresh token
    if (error.name === "TokenExpiredError") {
      console.log("Access token expired. Checking refresh token...");

      let refreshToken;
      if (req.cookies && req.cookies.refreshToken) {
        refreshToken = req.cookies.refreshToken;
      } else {
        return next(new ApiError(401, "Refresh token not provided"));
      }

      try {
        // Verify the refresh token
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        // If refresh token is valid, generate new tokens
        const { accessToken, refreshToken: newRefreshToken } =
          await generateAccessAndRefreshToken(decodedRefresh.userId);

        const options = {
          httpOnly: true,
          secure: true
        };
        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", newRefreshToken, options);

        // Optionally, attach the decoded access token payload to req.user
        req.user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        return next();
      } catch (refreshError) {
        console.log("Refresh token error:", refreshError);
        return next(new ApiError(403, "Refresh token expired or invalid"));
      }
    }

    // If the error is not due to expiration
    return next(new ApiError(403, "Invalid token"));
  }
};
