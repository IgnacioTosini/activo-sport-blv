import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sizes = await prisma.size.findMany({
      orderBy: { usSize: "asc" },
      select: {
        id: true,
        usSize: true,
        eurSize: true,
        cmSize: true,
      },
    });

    return NextResponse.json({ ok: true, sizes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener los talles.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
