import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CatalogType = "brand" | "category";

function getCatalogType(value: string | null): CatalogType | null {
  if (value === "brand" || value === "category") {
    return value;
  }

  return null;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = getCatalogType(searchParams.get("type"));

  if (!type) {
    return NextResponse.json({ ok: false, message: "Tipo de catalogo invalido." }, { status: 400 });
  }

  const items =
    type === "brand"
      ? await prisma.brand.findMany({ orderBy: { name: "asc" } })
      : await prisma.category.findMany({ orderBy: { name: "asc" } });

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { type?: string; name?: string };
    const type = getCatalogType(body.type ?? null);
    const name = toText(body.name);

    if (!type || !name) {
      return NextResponse.json({ ok: false, message: "Datos invalidos." }, { status: 400 });
    }

    const item =
      type === "brand"
        ? await prisma.brand.create({ data: { name } })
        : await prisma.category.create({ data: { name } });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: false, message: "El nombre ya existe." }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "No se pudo crear el registro.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { type?: string; id?: string; name?: string };
    const type = getCatalogType(body.type ?? null);
    const id = toText(body.id);
    const name = toText(body.name);

    if (!type || !id || !name) {
      return NextResponse.json({ ok: false, message: "Datos invalidos." }, { status: 400 });
    }

    const item =
      type === "brand"
        ? await prisma.brand.update({ where: { id }, data: { name } })
        : await prisma.category.update({ where: { id }, data: { name } });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: false, message: "El nombre ya existe." }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "No se pudo actualizar el registro.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { type?: string; id?: string };
    const type = getCatalogType(body.type ?? null);
    const id = toText(body.id);

    if (!type || !id) {
      return NextResponse.json({ ok: false, message: "Datos invalidos." }, { status: 400 });
    }

    if (type === "brand") {
      const linkedProducts = await prisma.product.count({ where: { brandId: id } });
      if (linkedProducts > 0) {
        return NextResponse.json(
          { ok: false, message: "No se puede eliminar: hay productos asociados a esta marca." },
          { status: 409 }
        );
      }

      await prisma.brand.delete({ where: { id } });
    } else {
      const linkedProducts = await prisma.product.count({ where: { categoryId: id } });
      if (linkedProducts > 0) {
        return NextResponse.json(
          { ok: false, message: "No se puede eliminar: hay productos asociados a esta categoria." },
          { status: 409 }
        );
      }

      await prisma.category.delete({ where: { id } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el registro.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
