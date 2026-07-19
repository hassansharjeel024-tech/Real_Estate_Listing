/**
 * JWT sign/verify built on `jose`.
 * `jsonwebtoken` depends on Node crypto and cannot run in middleware (Edge
 * runtime), so `jose` is used everywhere to keep one implementation.
 */
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  [key: string]: unknown;
}

const ISSUER = "real-estate-portal";
export const SESSION_COOKIE = "rep_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** Returns the payload, or null for any invalid/expired/tampered token. */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
