import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";

const SESSION_COOKIE = "novus_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type UserDocument = {
  _id: ObjectId;
  active: boolean;
  createdAt: Date;
  email: string;
  passwordHash: string;
  role: "admin";
  tenantId: string;
};

type SessionDocument = {
  _id: ObjectId;
  createdAt: Date;
  expiresAt: Date;
  tokenHash: string;
  userId: ObjectId;
};

export type AuthenticatedUser = Pick<UserDocument, "email" | "role" | "tenantId"> & {
  id: string;
};

export const sessionCookieName = SESSION_COOKIE;

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await deriveKey(password, salt, 64);

  return `${salt}.${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedValue: string) {
  const [salt, expectedValue] = storedValue.split(".");

  if (!salt || !expectedValue) {
    return false;
  }

  const expected = Buffer.from(expectedValue, "base64url");
  const derivedKey = await deriveKey(password, salt, expected.length);

  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

export async function findUserByEmail(email: string) {
  const database = await getDatabase();

  return database.collection<UserDocument>("users").findOne({ email });
}

export async function createSession(userId: ObjectId) {
  const database = await getDatabase();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await database.collection<SessionDocument>("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database.collection<SessionDocument>("sessions").insertOne({
    _id: new ObjectId(),
    createdAt: new Date(),
    expiresAt,
    tokenHash: hashSessionToken(token),
    userId,
  });

  return { expiresAt, token };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return token ? getUserFromSession(token) : null;
}

export async function deleteSession(token: string | undefined) {
  if (!token) {
    return;
  }

  const database = await getDatabase();
  await database.collection<SessionDocument>("sessions").deleteOne({ tokenHash: hashSessionToken(token) });
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

async function getDatabase() {
  const client = await getMongoClient();

  return client.db();
}

async function getUserFromSession(token: string): Promise<AuthenticatedUser | null> {
  const database = await getDatabase();
  const session = await database.collection<SessionDocument>("sessions").findOne({
    expiresAt: { $gt: new Date() },
    tokenHash: hashSessionToken(token),
  });

  if (!session) {
    return null;
  }

  const user = await database.collection<UserDocument>("users").findOne({
    _id: session.userId,
    active: true,
  });

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    id: user._id.toHexString(),
    role: user.role,
    tenantId: user.tenantId,
  };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function deriveKey(password: string, salt: string, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, length, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Buffer.from(derivedKey));
    });
  });
}
