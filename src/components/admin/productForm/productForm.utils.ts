export type CustomStockRow = {
  id: string;
  usSize: string;
  eurSize: string;
  cmSize: string;
  quantity: string;
};

export type GalleryImageItem = {
  id: string;
  url: string;
  replacementFile?: File;
  isReplacementPending?: boolean;
};

export function isNextRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("digest" in error)) {
    return false;
  }

  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export function createEmptyCustomStockRow(): CustomStockRow {
  return {
    id: crypto.randomUUID(),
    usSize: "",
    eurSize: "",
    cmSize: "",
    quantity: "",
  };
}

export function createInitialGalleryItems(images: { url: string }[]): GalleryImageItem[] {
  return images.map((img) => ({
    id: crypto.randomUUID(),
    url: img.url,
    isReplacementPending: false,
  }));
}

export function revokeObjectUrlIfBlob(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
