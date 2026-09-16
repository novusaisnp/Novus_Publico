import { spawn } from "node:child_process";
import { loadEnvFile } from "node:process";

loadEnvFile("atlas-credentials.env");
process.env.MONGODB_DNS_SERVER ??= "1.1.1.1";

const child = spawn(
  process.execPath,
  [
    "--require",
    "./scripts/mongo-dns.cjs",
    "./node_modules/next/dist/bin/next",
    "dev",
  ],
  { env: process.env, stdio: "inherit" },
);

child.on("exit", (code) => process.exit(code ?? 1));
