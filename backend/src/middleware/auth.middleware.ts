import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import logger from "../utils/logger";
import User from "../models/User";

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return null;
};

const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.jwt.accessSecret);
  if (typeof decoded === "string") throw new Error("Invalid token payload");
  return decoded;
};

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res
        .status(401)
        .json({ flag: "error", message: "Authentication token missing" });
    }

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ flag: "error", message: "User no longer exists" });
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ flag: "error", message: "Your account has been blocked" });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Failed to authenticate token", error);
    return res
      .status(401)
      .json({ flag: "error", message: "Failed to verify the JWT token." });
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && !user.isBlocked) req.user = user;
  } catch (error) {
    logger.warn("Ignoring invalid token for optional auth", error);
  }
  next();
}
