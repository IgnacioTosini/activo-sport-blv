import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SizePayload = {
  id?: string;
  usSize?: number | string;
  eurSize?: number | string;
  cmSize?: number | string;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveFloat(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number.parseFloat(toText(value));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET() {
  try {
    const items = await prisma.size.findMany({
      orderBy: { usSize: "asc" },
      select: {
        id: true,
        usSize: true,
        eurSize: true,
        cmSize: true,
      },
    });

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener los talles.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SizePayload;
    const usSize = toPositiveFloat(body.usSize);
    const eurSize = toPositiveFloat(body.eurSize);
    const cmSize = toPositiveFloat(body.cmSize);

    if (usSize === null || eurSize === null || cmSize === null) {
      return NextResponse.json({ ok: false, message: "Datos invalidos." }, { status: 400 });
    }

    const item = await prisma.size.create({
      data: { usSize, eurSize, cmSize },
      select: {
        id: true,
        usSize: true,
        eurSize: true,
        cmSize: true,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: false, message: "Ese talle ya existe." }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "No se pudo crear el talle.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as SizePayload;
    const id = toText(body.id);
    const usSize = toPositiveFloat(body.usSize);
    const eurSize = toPositiveFloat(body.eurSize);
    const cmSize = toPositiveFloat(body.cmSize);

    if (!id || usSize === null || eurSize === null || cmSize === null) {
      return NextResponse.json({ ok: false, message: "Datos invalidos." }, { status: 400 });
    }

    const item = await prisma.size.update({
      where: { id },
      data: { usSize, eurSize, cmSize },
      select: {
        id: true,
        usSize: true,
        eurSize: true,
        cmSize: true,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: false, message: "Ese talle ya existe." }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "No se pudo actualizar el talle.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as SizePayload;
    const id = toText(body.id);

    if (!id) {
      return NextResponse.json({ ok: false, message: "Datos invalidos." }, { status: 400 });
    }

    const [stockCount, cartCount, orderCount] = await Promise.all([
      prisma.stock.count({ where: { sizeId: id } }),
      prisma.cartItem.count({ where: { sizeId: id } }),
      prisma.orderItem.count({ where: { sizeId: id } }),
    ]);

    if (stockCount > 0 || cartCount > 0 || orderCount > 0) {
      return NextResponse.json(
        { ok: false, message: "No se puede eliminar: hay registros asociados a este talle." },
        { status: 409 }
      );
    }

    await prisma.size.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el talle.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
