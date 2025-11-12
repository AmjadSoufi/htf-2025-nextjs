import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const rows = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: { xp: 0, rank: "Beginner" } }),
        { status: 200 }
      );
    }

    const row = rows[0];
    return new Response(
      JSON.stringify({ success: true, data: { xp: Number(row.xp) || 0, rank: row.rank } }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("/api/user/progress GET error:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
    });
  }
}
