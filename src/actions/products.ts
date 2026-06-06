
"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  deleteCloudinaryAssetsByUrls,
  ensureBrand,
  ensureCategory,
  productWithRelationsInclude,
  resolveStockRows,
  toText,
  validateProductInput,
} from "@/actions/utils/productActions.utils";
import { mapProductImages, mapProductsImages } from "@/helpers/cloudinary/mapProductImages";

type ProductActionState = {
  ok: boolean;
  message: string;
};

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = validateProductInput(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  try {
    const payload = parsed.value;
    const brand = await ensureBrand(payload.brandName);
    const category = await ensureCategory(payload.categoryName);
    const resolvedStockRows = await resolveStockRows(payload.stockRows);

    await prisma.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        featured: payload.featured,
        isNew: payload.isNew,
        surfaceType: payload.surfaceType,
        mainImage: payload.mainImage,
        brandId: brand.id,
        categoryId: category.id,
        images: {
          create: payload.galleryImages.map((url) => ({ url })),
        },
        stock: {
          create: resolvedStockRows.map((row) => ({
            sizeId: row.sizeId,
            quantity: row.quantity,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    return { ok: true, message: "Producto creado correctamente." };
  } catch (error) {
    unstable_rethrow(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { ok: false, message: "El slug ya existe. Probá con uno diferente." };
    }

    const reason = error instanceof Error ? error.message : null;
    return { ok: false, message: reason ? `No se pudo crear el producto: ${reason}` : "No se pudo crear el producto." };
  }
}

export async function updateProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const productId = toText(formData.get("productId"));

  if (!productId) {
    return { ok: false, message: "Falta el identificador del producto." };
  }

  const parsed = validateProductInput(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  try {
    const payload = parsed.value;
    const brand = await ensureBrand(payload.brandName);
    const category = await ensureCategory(payload.categoryName);
    const resolvedStockRows = await resolveStockRows(payload.stockRows);

    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
      },
    });

    if (!currentProduct) {
      return { ok: false, message: "No se encontro el producto a actualizar." };
    }

    const retainedUrls = new Set([payload.mainImage, ...payload.galleryImages]);
    const removedGalleryUrls = currentProduct.images
      .map((image) => image.url)
      .filter((url) => !retainedUrls.has(url));

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        featured: payload.featured,
        isNew: payload.isNew,
        surfaceType: payload.surfaceType,
        mainImage: payload.mainImage,
        brandId: brand.id,
        categoryId: category.id,
        images: {
          deleteMany: {},
          create: payload.galleryImages.map((url) => ({ url })),
        },
        stock: {
          deleteMany: {},
          create: resolvedStockRows.map((row) => ({
            sizeId: row.sizeId,
            quantity: row.quantity,
          })),
        },
      },
    });

    await deleteCloudinaryAssetsByUrls(removedGalleryUrls);

    revalidatePath("/admin/products");
    return { ok: true, message: "Producto actualizado correctamente." };
  } catch (error) {
    unstable_rethrow(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { ok: false, message: "El slug ya existe. Probá con uno diferente." };
    }

    const reason = error instanceof Error ? error.message : null;
    return {
      ok: false,
      message: reason ? `No se pudo actualizar el producto: ${reason}` : "No se pudo actualizar el producto.",
    };
  }
}

export async function toggleProductStatusAction(
  formData: FormData
) {
  const productId = toText(
    formData.get("productId")
  );

  if (!productId) return;

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      isActive: true,
    },
  });

  if (!product) return;

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive: !product.isActive,
    },
  });

  revalidatePath("/admin/products");
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: productWithRelationsInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return mapProductsImages(products);
}

export async function getAllProductsForAdmin() {
  return prisma.product.findMany({
    include: productWithRelationsInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productWithRelationsInclude,
  });

  return product
    ? mapProductImages(product)
    : null;
}

export async function getProductBySlug(
  slug?: string
) {
  if (!slug?.trim()) {
    return null;
  }

  const product =
    await prisma.product.findUnique({
      where: {
        slug: slug.trim(),
      },
      include: productWithRelationsInclude,
    });

  return product
    ? mapProductImages(product)
    : null;
}

export async function getProductByFeatured(
  featured: boolean
) {
  const products =
    await prisma.product.findMany({
      where: {
        featured,
        isActive: true,
      },
      include: productWithRelationsInclude,
    });

  return mapProductsImages(products);
}