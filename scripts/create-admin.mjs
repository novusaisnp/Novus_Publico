import { createHash, randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { setServers } from "node:dns";
import { loadEnvFile } from "node:process";

loadEnvFile("atlas-credentials.env");

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const dnsServer = process.env.MONGODB_DNS_SERVER ?? "1.1.1.1";
setServers([dnsServer]);

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLocaleLowerCase("pt-BR");
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const tenantId = process.env.BOOTSTRAP_TENANT_ID ?? "novus-publico-inicial";

if (!email || !password) {
  throw new Error("Defina BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD em um arquivo ignorado pelo Git.");
}

if (password.length < 12) {
  throw new Error("A senha inicial precisa ter ao menos 12 caracteres.");
}

const { MongoClient } = await import("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const users = client.db().collection("users");
  await users.createIndex({ email: 1 }, { unique: true });

  const result = await users.updateOne(
    { email },
    {
      $setOnInsert: {
        active: true,
        createdAt: new Date(),
        email,
        passwordHash: hashPassword(password),
        role: "admin",
        tenantId,
      },
    },
    { upsert: true },
  );

  if (!result.upsertedCount) {
    throw new Error("Já existe um usuário com este e-mail. Nenhuma credencial foi alterada.");
  }

  console.log("Administrador inicial criado com sucesso.");
} finally {
  await client.close();
}

function hashPassword(value) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(value, salt, 64).toString("base64url");

  return `${salt}.${key}`;
}
