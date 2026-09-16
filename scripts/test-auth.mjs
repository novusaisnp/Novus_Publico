import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { setServers } from "node:dns";
import { loadEnvFile } from "node:process";

loadEnvFile("atlas-credentials.env");

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

setServers([process.env.MONGODB_DNS_SERVER ?? "1.1.1.1"]);

const { MongoClient } = await import("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);
const suffix = randomBytes(9).toString("hex");
const email = `auth-test-${suffix}@example.invalid`;
const password = randomBytes(24).toString("base64url");
const users = client.db().collection("users");
const sessions = client.db().collection("sessions");
let testUserId;

try {
  await client.connect();
  const createdUser = await users.insertOne({
    active: true,
    createdAt: new Date(),
    email,
    passwordHash: hashPassword(password),
    role: "admin",
    tenantId: "integration-test",
  });
  testUserId = createdUser.insertedId;

  const login = await fetch("http://localhost:3000/api/auth/login", {
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const cookie = login.headers.get("set-cookie")?.split(";", 1)[0];

  if (!login.ok || !cookie) {
    throw new Error("O login não retornou uma sessão válida.");
  }

  const panel = await fetch("http://localhost:3000/painel", { headers: { Cookie: cookie } });

  if (!panel.ok || !(await panel.text()).includes(email)) {
    throw new Error("A rota protegida não reconheceu a sessão.");
  }

  const logout = await fetch("http://localhost:3000/api/auth/logout", { headers: { Cookie: cookie }, method: "POST" });

  if (!logout.ok) {
    throw new Error("O encerramento de sessão falhou.");
  }

  console.log("AUTH_FLOW_OK");
} finally {
  if (testUserId) {
    await sessions.deleteMany({ userId: testUserId });
  }
  await users.deleteOne({ email });
  await client.close();
}

function hashPassword(value) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(value, salt, 64).toString("base64url");

  return `${salt}.${key}`;
}
