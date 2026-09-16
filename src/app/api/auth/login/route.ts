import { NextResponse } from "next/server";
import {
  createSession,
  findUserByEmail,
  normalizeEmail,
  sessionCookieName,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  const payload = await readPayload(request);

  if (!payload || typeof payload.email !== "string" || typeof payload.password !== "string") {
    return unauthorized();
  }

  const user = await findUserByEmail(normalizeEmail(payload.email));

  if (!user || !user.active || !(await verifyPassword(payload.password, user.passwordHash))) {
    return unauthorized();
  }

  const session = await createSession(user._id);
  const response = NextResponse.json({ status: "ok" });

  response.cookies.set(sessionCookieName, session.token, sessionCookieOptions(session.expiresAt));

  return response;
}

async function readPayload(request: Request): Promise<LoginPayload | null> {
  try {
    return (await request.json()) as LoginPayload;
  } catch {
    return null;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
}
