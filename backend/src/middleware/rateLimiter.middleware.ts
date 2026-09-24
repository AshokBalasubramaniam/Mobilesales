import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { RedisReply } from "rate-limit-redis";
import getRedisClient from "../config/redis";
import env from "../config/env";

// Shares limiter state across all instances behind a load balancer. Without
// Redis configured, express-rate-limit falls back to its own in-memory
// store — fine for a single dev process, but each instance would otherwise
// track its own counters in production and undercount real request volume.
const redisStore = (prefix: string): RedisStore | undefined => {
  const client = getRedisClient();
  if (!client) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]): Promise<RedisReply> =>
      client.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
    prefix,
  });
};

export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:general:"),
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:auth:"),
  message: {
    success: false,
    statusCode: 429,
    message: "Too many attempts, please try again later",
  },
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  // Also guards /auth/firebase-login, which a single signup calls twice
  // (once to check the number, once to complete registration) — 5 was too
  // tight for that plus a couple of retries.
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:otp:"),
  message: {
    success: false,
    statusCode: 429,
    message: "Too many OTP requests, please try again later",
  },
});
