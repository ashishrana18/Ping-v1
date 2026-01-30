// src/middleware/rateLimiter.js
import { client } from "../redis/redis.js"; // your Redis client instance
import { ApiError } from "../utils/ApiError.js";

export function slidingWindowRateLimiter({
  windowSizeInSeconds = 60,
  maxRequests = 100,
  // choose identifier: req.user.userId if logged in, otherwise req.ip
  getId = (req) => req.user?.userId || req.ip,
} = {}) {
  return async function rateLimiter(req, res, next) {
    try {
      const id = getId(req);
      if (!id) return next(); // no identifier → skip

      const now = Date.now();
      const windowStart = now - windowSizeInSeconds * 1000;
      const key = `rate:${id}`;

      // add current timestamp
      await client.zAdd(key, { value: `${now}`, score: now });
      // remove all older than window
      await client.zRemRangeByScore(key, 0, windowStart);
      // count how many remain
      const reqCount = await client.zCard(key);
      // set an expiry so we don't leave empty sets hanging around
      await client.expire(key, windowSizeInSeconds);

      if (reqCount > maxRequests) {
        // too many requests in window
        throw new ApiError(
          429,
          `Rate limit exceeded – max ${maxRequests} requests per ${windowSizeInSeconds}s`,
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
