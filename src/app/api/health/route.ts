import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await getMongoClient();
    await client.db().command({ ping: 1 });

    return Response.json({ database: "connected", status: "ok" });
  } catch (error) {
    console.error("Falha ao conectar ao MongoDB", error);

    return Response.json(
      { database: "unavailable", status: "error" },
      { status: 503 },
    );
  }
}
