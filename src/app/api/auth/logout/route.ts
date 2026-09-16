import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  await deleteSession(cookieStore.get(sessionCookieName)?.value);

  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
