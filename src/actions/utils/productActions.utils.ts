import { Prisma, SurfaceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export const productWithRelationsInclude = {
  brand: true,
  category: true,
  stock: {
    include: {
      size: true,
    },
    orderBy: {
      size: {
        usSize: "asc",
      },
    },
  },
  images: true,
} as const;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productWithRelationsInclude;
}>;

export type ProductPayload = {
  name: string;
  slug: string;
  description: string;
  price: number;
  surfaceType: SurfaceType;
  brandName: string;
  categoryName: string;
  mainImage: string;
  galleryImages: string[];
  featured: boolean;
  isNew: boolean;
  stockRows: Array<
    | { sizeId: string; quantity: number }
    | { usSize: number; eurSize: number; cmSize: number; quantity: number }
  >;
};

export type ValidationResult =
  | { ok: false; error: string }
  | {
    ok: true;
    value: ProductPayload;
  };

const SURFACE_TYPES = new Set(Object.values(SurfaceType));

export function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: FormDataEntryValue | null) {
  const text = toText(value).replace(",", ".");
  const numberValue = Number(text);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureBrand(brandName: string) {
  return prisma.brand.upsert({
    where: { name: brandName },
    update: {},
    create: { name: brandName },
  });
}

export async function ensureCategory(categoryName: string) {
  return prisma.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });
}

function parseGalleryImages(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseStockRows(formData: FormData) {
  const existingRows = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("stockSizeId_"))
    .map(([key, value]) => {
      const rowId = key.replace("stockSizeId_", "");
      const sizeId = toText(value);
      const quantity = Number.parseInt(toText(formData.get(`stockQty_${rowId}`)), 10);
      return { sizeId, quantity: Number.isFinite(quantity) ? quantity : NaN };
    })
    .filter((row) => row.sizeId.length > 0 && Number.isInteger(row.quantity) && row.quantity > 0);

  const customRowIds = Array.from(formData.keys())
    .filter((key) => key.startsWith("stockCustomUs_"))
    .map((key) => key.replace("stockCustomUs_", ""));

  const customRows = customRowIds
    .map((rowId) => {
      const usSize = Number.parseFloat(toText(formData.get(`stockCustomUs_${rowId}`)).replace(",", "."));
      const eurSize = Number.parseFloat(toText(formData.get(`stockCustomEur_${rowId}`)).replace(",", "."));
      const cmSize = Number.parseFloat(toText(formData.get(`stockCustomCm_${rowId}`)).replace(",", "."));
      const quantity = Number.parseInt(toText(formData.get(`stockCustomQty_${rowId}`)), 10);

      return {
        usSize,
        eurSize,
        cmSize,
        quantity: Number.isFinite(quantity) ? quantity : NaN,
      };
    })
    .filter(
      (row) =>
        Number.isFinite(row.usSize) &&
        row.usSize > 0 &&
        Number.isFinite(row.eurSize) &&
        row.eurSize > 0 &&
        Number.isFinite(row.cmSize) &&
        row.cmSize > 0 &&
        Number.isInteger(row.quantity) &&
        row.quantity > 0
    );

  const existingMap = new Map<string, number>();

  for (const row of existingRows) {
    existingMap.set(row.sizeId, (existingMap.get(row.sizeId) ?? 0) + row.quantity);
  }

  const customMap = new Map<string, { usSize: number; eurSize: number; cmSize: number; quantity: number }>();

  for (const row of customRows) {
    const key = `${row.usSize}|${row.eurSize}|${row.cmSize}`;
    const current = customMap.get(key);

    if (current) {
      current.quantity += row.quantity;
    } else {
      customMap.set(key, row);
    }
  }

  return [
    ...Array.from(existingMap.entries()).map(([sizeId, quantity]) => ({ sizeId, quantity })),
    ...Array.from(customMap.values()),
  ];
}

export async function resolveStockRows(
  rows: ProductPayload["stockRows"]
): Promise<Array<{ sizeId: string; quantity: number }>> {
  const resolved: Array<{ sizeId: string; quantity: number }> = [];

  for (const row of rows) {
    if ("sizeId" in row) {
      resolved.push({ sizeId: row.sizeId, quantity: row.quantity });
      continue;
    }

    const size = await prisma.size.upsert({
      where: {
        usSize_eurSize_cmSize: {
          usSize: row.usSize,
          eurSize: row.eurSize,
          cmSize: row.cmSize,
        },
      },
      update: {},
      create: {
        usSize: row.usSize,
        eurSize: row.eurSize,
        cmSize: row.cmSize,
      },
    });

    resolved.push({ sizeId: size.id, quantity: row.quantity });
  }

  return resolved;
}

function parseSurfaceType(value: string) {
  return SURFACE_TYPES.has(value as SurfaceType) ? (value as SurfaceType) : null;
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return true;
}

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = "/upload/";
    const markerIndex = parsed.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const pathAfterUpload = parsed.pathname.slice(markerIndex + marker.length);
    const segments = pathAfterUpload.split("/").filter(Boolean);

    while (segments.length > 0 && (segments[0].includes(",") || /^v\d+$/.test(segments[0]))) {
      segments.shift();
    }

    if (segments.length === 0) {
      return null;
    }

    const joined = segments.join("/");
    const withoutExt = joined.replace(/\.[a-zA-Z0-9]+$/, "");
    return decodeURIComponent(withoutExt);
  } catch {
    return null;
  }
}

export async function deleteCloudinaryAssetsByUrls(urls: string[]) {
  if (urls.length === 0) {
    return;
  }

  if (!configureCloudinary()) {
    return;
  }

  const publicIds = urls
    .map(extractCloudinaryPublicId)
    .filter((value): value is string => Boolean(value));

  if (publicIds.length === 0) {
    return;
  }

  await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      })
    )
  );
}

export function validateProductInput(formData: FormData): ValidationResult {
  const name = toText(formData.get("name"));
  const slugRaw = toText(formData.get("slug"));
  const description = toText(formData.get("description"));
  const price = toNumber(formData.get("price"));
  const surfaceType = parseSurfaceType(toText(formData.get("surfaceType")));
  const brandName = toText(formData.get("brandName"));
  const categoryName = toText(formData.get("categoryName"));
  const mainImage = toText(formData.get("mainImage"));
  const galleryRaw = toText(formData.get("galleryImages"));
  const featured = toText(formData.get("featured")) === "on";
  const isNew = toText(formData.get("isNew")) === "on";
  const stockRows = parseStockRows(formData);

  if (!name || !description || !brandName || !categoryName || !mainImage) {
    return { ok: false, error: "Completá nombre, descripción, marca, categoría e imagen principal." };
  }

  if (!surfaceType) {
    return { ok: false, error: "Seleccioná un tipo de suela válido." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "Ingresá un precio válido mayor a 0." };
  }

  if (stockRows.length === 0) {
    return { ok: false, error: "Ingresá al menos una fila de stock con cantidad mayor a 0." };
  }

  const computedStockTotal = stockRows.reduce((acc, row) => acc + row.quantity, 0);

  if (computedStockTotal <= 0) {
    return { ok: false, error: "La suma del stock por talle debe ser mayor a 0." };
  }

  const slug = slugify(slugRaw || name);

  if (!slug) {
    return { ok: false, error: "No se pudo generar un slug válido." };
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      description,
      price,
      surfaceType,
      brandName,
      categoryName,
      mainImage,
      galleryImages: parseGalleryImages(galleryRaw),
      featured,
      isNew,
      stockRows,
    },
  };
}
