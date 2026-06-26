// src/types/auth.ts

import type { Socket } from "socket.io";

/**
 * Represents the authenticated user throughout the application.
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * JWT payload returned by jwt.verify().
 * Currently it's identical to AuthUser.
 * If your JWT changes in the future, you only update this alias.
 */
export type JwtUserPayload = AuthUser;

/**
 * Extend Express Request globally.
 * Now every Request has an optional `user` property.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Socket after authentication.
 * Used instead of (socket as any).user
 */
export interface AuthSocket extends Socket {
  user: AuthUser;
}

export {};