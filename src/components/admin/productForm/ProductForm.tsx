"use client";

import { DragEvent, useActionState, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { SurfaceType } from "@prisma/client";
import { CatalogManagedField } from "@/components/admin/catalogManagedField/CatalogManagedField";
import { SizeManagerModal } from "@/components/admin/sizeManager/SizeManagerModal";
import { ImageOptimizerPreview } from "@/components/media/ImageOptimizer/ImageOptimizerPreview";
import { ImageService } from "@/services/ImageService";
import { ProductGalleryEditor } from "./ProductGalleryEditor";
import {
  createInitialGalleryItems,
  CustomStockRow,
  GalleryImageItem,
  isNextRedirectError,
  revokeObjectUrlIfBlob,
} from "./productForm.utils";
import { surfaceItems } from "@/utils/glossary";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { validateImageDimensions } from "@/helpers/cloudinary/validateImageDimensions";
import Image from "next/image";
import "./_productForm.scss";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  featured: boolean;
  isNew: boolean;
  surfaceType: SurfaceType;
  mainImage: string;
  brand: { name: string };
  category: { name: string };
  images: { url: string }[];
  stock: { sizeId: string; quantity: number; size?: { usSize: number; eurSize: number; cmSize: number } }[];
};

type SizeOption = {
  id: string;
  usSize: number;
  eurSize: number;
  cmSize: number;
};

type ProductActionState = {
  ok: boolean;
  message: string;
};

type ProductFormProps = {
  sizes: SizeOption[];
  brandOptions: string[];
  categoryOptions: string[];
  editingProduct: ProductWithRelations | null;
  updated: boolean;
  createAction: (
    state: ProductActionState,
    formData: FormData
  ) => Promise<ProductActionState>;
  updateAction: (
    state: ProductActionState,
    formData: FormData
  ) => Promise<ProductActionState>;
};

const INITIAL_STATE: ProductActionState = {
  ok: false,
  message: "",
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="productFormPrimaryButton" type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </button>
  );
}

export function ProductForm({
  sizes,
  brandOptions,
  categoryOptions,
  editingProduct,
  createAction,
  updateAction,
}: ProductFormProps) {
  const [sizesState, setSizesState] = useState<SizeOption[]>(sizes);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [brandOptionsState, setBrandOptionsState] = useState<string[]>(brandOptions);
  const [categoryOptionsState, setCategoryOptionsState] = useState<string[]>(categoryOptions);
  const [brandNameValue, setBrandNameValue] = useState(editingProduct?.brand.name ?? "");
  const [categoryNameValue, setCategoryNameValue] = useState(editingProduct?.category.name ?? "");
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const action = editingProduct ? updateAction : createAction;

  const stockMap = useMemo(
    () => new Map(editingProduct?.stock.map((item) => [item.sizeId, item.quantity]) ?? []),
    [editingProduct]
  );
  const initialExistingStockQuantities = useMemo(
    () => Object.fromEntries(sizesState.map((size) => [size.id, String(stockMap.get(size.id) ?? 0)])),
    [sizesState, stockMap]
  );
  const [existingStockQuantities, setExistingStockQuantities] = useState<Record<string, string>>(() =>
    initialExistingStockQuantities
  );
  const [mainImageValue, setMainImageValue] = useState(() => editingProduct?.mainImage ?? "");
  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>(() =>
    createInitialGalleryItems(editingProduct?.images ?? [])
  );
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageStats, setMainImageStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [customStockRows, setCustomStockRows] = useState<CustomStockRow[]>([]);
  const [imagePreviewResetKey, setImagePreviewResetKey] = useState(0);

  const galleryFileNames = useMemo(() => galleryFiles.map((file) => file.name), [galleryFiles]);
  const computedStockTotal = useMemo(() => {
    const existingTotal = Object.values(existingStockQuantities).reduce((acc, qty) => {
      const parsed = Number.parseInt(qty, 10);
      return Number.isInteger(parsed) && parsed > 0 ? acc + parsed : acc;
    }, 0);

    const customTotal = customStockRows.reduce((acc, row) => {
      const parsed = Number.parseInt(row.quantity, 10);
      return Number.isInteger(parsed) && parsed > 0 ? acc + parsed : acc;
    }, 0);

    return existingTotal + customTotal;
  }, [existingStockQuantities, customStockRows]);

  const handleSizesChange = (nextSizes: SizeOption[]) => {
    setSizesState(nextSizes);
    setExistingStockQuantities((prev) => {
      const next: Record<string, string> = {};

      for (const size of nextSizes) {
        next[size.id] = prev[size.id] ?? String(stockMap.get(size.id) ?? 0);
      }

      return next;
    });
  };

  const uploadAndPrepareFormData = async (formData: FormData) => {
    const uploadedGalleryUrls: string[] = [];

    if (mainImageFile) {
      const response = await ImageService.uploadImage(mainImageFile, {
        enableOptimization: true,
        format: "webp",
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.9,
        maxSizeKB: 350,
      });

      if (!response.success || !response.url) {
        throw new Error(response.error || "No se pudo subir la imagen principal.");
      }

      formData.set("mainImage", response.url);
      setMainImageValue(response.url);
    }

    const resolvedGalleryUrls: string[] = [];

    for (const item of galleryItems) {
      if (item.replacementFile) {
        const response = await ImageService.uploadImage(item.replacementFile, {
          enableOptimization: true,
          format: "webp",
          maxWidth: 1280,
          maxHeight: 1080,
          quality: 0.9,
          maxSizeKB: 350,
        });

        if (!response.success || !response.url) {
          throw new Error(response.error || "No se pudo subir una imagen reemplazada de galeria.");
        }

        resolvedGalleryUrls.push(response.url);
      } else {
        resolvedGalleryUrls.push(item.url);
      }
    }

    if (galleryFiles.length > 0) {
      const uploads = await Promise.all(
        galleryFiles.map((file) =>
          ImageService.uploadImage(file, {
            enableOptimization: true,
            format: "webp",
            maxWidth: 1280,
            maxHeight: 1080,
            quality: 0.9,
            maxSizeKB: 350,
          })
        )
      );

      for (const upload of uploads) {
        if (!upload.success || !upload.url) {
          throw new Error(upload.error || "No se pudieron subir las imagenes de galeria.");
        }

        uploadedGalleryUrls.push(upload.url);
      }
    }

    const finalGalleryUrls = [...resolvedGalleryUrls, ...uploadedGalleryUrls];
    formData.set("galleryImages", finalGalleryUrls.join("\n"));
    setGalleryItems((prev) =>
      prev.map((item, index) => ({
        ...item,
        url: finalGalleryUrls[index] ?? item.url,
        replacementFile: undefined,
        isReplacementPending: false,
      }))
    );
    setGalleryFiles([]);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const productFormAction = async (prevState: ProductActionState, formData: FormData) => {
    try {
      await uploadAndPrepareFormData(formData);
      const result = await action(prevState, formData);

      if (!editingProduct && result.ok) {
        resetCreateForm();
        toast.success("Producto creado exitosamente.");
      }

      if (editingProduct && result.ok) {
        toast.success("Producto actualizado exitosamente.");
        router.push("/admin/products?updated=1");
      }
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron subir las imagenes.");
      if (isNextRedirectError(error)) {
        throw error;
      }

      return {
        ok: false,
        message: error instanceof Error ? error.message : "No se pudieron subir las imagenes.",
      };
    }
  };

  const [state, formAction] = useActionState(productFormAction, INITIAL_STATE);

  const onGalleryFilesChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files ?? []
    );

    const validFiles: File[] = [];

    for (const file of files) {
      const isValid =
        await validateImageDimensions(file);

      if (isValid) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setGalleryFiles((prev) => [...prev, ...validFiles]);

    event.target.value = "";
  };

  const onGalleryDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files ?? []);

    if (files.length === 0) {
      return;
    }

    setGalleryFiles((prev) => [...prev, ...files]);
  };

  const updateExistingStockQuantity = (sizeId: string, value: string) => {
    setExistingStockQuantities((prev) => ({ ...prev, [sizeId]: value }));
  };

  function resetUploadState() {
    setMainImageFile(null);
    setMainImageStats(null);
    setGalleryItems((prev) => {
      prev.forEach((item) => revokeObjectUrlIfBlob(item.url));
      return createInitialGalleryItems(editingProduct?.images ?? []);
    });
    setGalleryFiles([]);
    setImagePreviewResetKey((prev) => prev + 1);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }

  function resetCreateForm() {
    formRef.current?.reset();
    setMainImageValue("");
    setBrandNameValue("");
    setCategoryNameValue("");
    setGalleryItems((prev) => {
      prev.forEach((item) => revokeObjectUrlIfBlob(item.url));
      return [];
    });
    setExistingStockQuantities(initialExistingStockQuantities);
    setCustomStockRows([]);
    resetUploadState();
  }

  const removePreviewGalleryImage = (name: string) => {
    setGalleryFiles((prev) => {
      prev.forEach((file) => {
        const fileUrl = URL.createObjectURL(file);
        if (file.name === name) {
          URL.revokeObjectURL(fileUrl);
        }
      });
      return prev.filter((file) => file.name !== name);
    });
  };

  const removeGalleryImage = (idToRemove: string) => {
    setGalleryItems((prev) => {
      const item = prev.find((entry) => entry.id === idToRemove);
      if (item) {
        revokeObjectUrlIfBlob(item.url);
      }
      return prev.filter((entry) => entry.id !== idToRemove);
    });
  };

  const replaceGalleryImage = (idToReplace: string, file: File) => {
    const localPreviewUrl = URL.createObjectURL(file);

    setGalleryItems((prev) =>
      prev.map((item) => {
        if (item.id !== idToReplace) {
          return item;
        }

        if (item.url !== localPreviewUrl) {
          revokeObjectUrlIfBlob(item.url);
        }

        return {
          ...item,
          url: localPreviewUrl,
          replacementFile: file,
          isReplacementPending: true,
        };
      })
    );
  };

  return (
    <form ref={formRef} action={formAction} className="productForm">
      <div className="productFormHeader">
        <h2 className="productFormTitle">{editingProduct ? "Editar producto" : "Nuevo producto"}</h2>
        {editingProduct ? (
          <a href="/admin/products" className="productFormSecondaryButton">
            Cancelar
          </a>
        ) : null}
      </div>

      {editingProduct ? <input type="hidden" name="productId" value={editingProduct.id} /> : null}
      <input type="hidden" name="mainImage" value={mainImageValue} readOnly />
      <input
        type="hidden"
        name="galleryImages"
        value={galleryItems
          .filter((item) => !item.isReplacementPending)
          .map((item) => item.url)
          .join("\n")}
        readOnly
      />

      <label className="productFormLabel">
        Nombre
        <input
          className="productFormInput"
          name="name"
          defaultValue={editingProduct?.name ?? ""}
          placeholder="Mercurial Superfly 10"
          required
        />
      </label>

      <div className="productFormRow2">
        <label className="productFormLabel">
          Slug
          <input
            className="productFormInput"
            name="slug"
            defaultValue={editingProduct?.slug ?? ""}
            placeholder="se genera solo si queda vacio"
          />
        </label>

        <label className="productFormLabel">
          Precio
          <input
            className="productFormInput"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={editingProduct?.price ?? ""}
            required
          />
        </label>
      </div>

      <label className="productFormLabel">
        Descripcion
        <textarea
          className="productFormTextarea"
          name="description"
          defaultValue={editingProduct?.description ?? ""}
          required
        />
      </label>

      <div className="productFormRow2">
        <CatalogManagedField
          label="Marca"
          type="brand"
          value={brandNameValue}
          inputName="brandName"
          options={brandOptionsState}
          placeholder="Selecciona o escribe una marca"
          required
          onValueChange={setBrandNameValue}
          onOptionsChange={setBrandOptionsState}
        />

        <CatalogManagedField
          label="Categoria"
          type="category"
          value={categoryNameValue}
          inputName="categoryName"
          options={categoryOptionsState}
          placeholder="Selecciona o escribe una categoria"
          required
          onValueChange={setCategoryNameValue}
          onOptionsChange={setCategoryOptionsState}
        />
      </div>

      <label className="productFormLabel">
        Tipo de suela
        <select
          className="productFormSelect"
          name="surfaceType"
          defaultValue={editingProduct?.surfaceType ?? surfaceItems.FG.label}
        >
          <option value={surfaceItems.FG.label}>{surfaceItems.FG.label}</option>
          <option value={surfaceItems.TF.label}>{surfaceItems.TF.label}</option>
          <option value={surfaceItems.AG.label}>{surfaceItems.AG.label}</option>
          <option value={surfaceItems.SG.label}>{surfaceItems.SG.label}</option>
        </select>
      </label>

      <div className="productFormMediaBlock">
        <p className="productFormMediaTitle">Imagen principal optimizada</p>
        <ImageOptimizerPreview
          resetSignal={imagePreviewResetKey}
          initialImageUrl={mainImageValue || undefined}
          options={{
            maxWidth: 1280,
            maxHeight: 1080,
            quality: 0.9,
            format: "webp",
            maxSizeKB: 350,
          }}
          onImageOptimized={(file, stats) => {
            setMainImageFile(file);
            setMainImageStats(stats);
          }}
          onClearSelection={() => {
            setMainImageFile(null);
            setMainImageStats(null);
            if (!editingProduct) {
              setMainImageValue("");
            }
          }}
        />
      </div>
      <div className="productFormImageHint">
        <strong>Recomendación:</strong>
        <span>
          Utiliza imágenes horizontales de al menos 1280x720 px, con el producto centrado y poco espacio vacío alrededor.
        </span>
      </div>

      {mainImageFile ? (
        <p className="productFormMediaHint">
          Imagen principal lista para subir: <strong>{mainImageFile.name}</strong>
          {mainImageStats
            ? ` (${mainImageStats.compressionRatio}% de reduccion, ${Math.round(mainImageStats.optimizedSize / 1024)}KB)`
            : ""}
        </p>
      ) : null}

      <label className="productFormDropZone" onDragOver={(event) => event.preventDefault()} onDrop={onGalleryDrop}>
        <span>Arrastra imagenes de galeria o selecciona multiples archivos</span>
        <input
          ref={galleryInputRef}
          className="productFormInputFile"
          type="file"
          accept="image/*"
          multiple
          onChange={onGalleryFilesChange}
        />
      </label>

      <ProductGalleryEditor items={galleryItems} onReplace={replaceGalleryImage} onRemove={removeGalleryImage} />

      {galleryFileNames.length > 0 ? (
        <div className="productFormPendingFiles">
          <p className="productFormMediaTitle">Imagenes de galeria pendientes de subida</p>
          <ul className="productFormPendingFilesList">
            {galleryFileNames.map((name, index) => (
              <li key={`${name}-${index}`}>
                <Image
                  src={galleryFiles[index] instanceof Blob ? URL.createObjectURL(galleryFiles[index]) : ""}
                  alt={name}
                  width={100}
                  height={100}
                />
                <button type="button" onClick={() => removePreviewGalleryImage(name)} className="productFormDangerInlineButton">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="productFormCheckboxRow">
        <label className="productFormCheckbox">
          <input type="checkbox" name="featured" defaultChecked={editingProduct?.featured ?? false} />
          Destacado
        </label>
        <label className="productFormCheckbox">
          <input type="checkbox" name="isNew" defaultChecked={editingProduct?.isNew ?? true} />
          Nuevo
        </label>
      </div>

      <div className="productFormStockBox">
        <p className="productFormMediaHint">
          Stock total: se calcula automaticamente con la suma del stock por talle.
        </p>
        <p className="productFormStockTotalLive">
          Total actual: <strong>{computedStockTotal}</strong>
        </p>

        <div className="sizeManagerTriggerRow">
          <p className="productFormStockTitle">Stock por talle</p>
          <button
            type="button"
            className="sizeManagerTriggerButton"
            aria-label="Gestionar talles"
            onClick={() => setIsSizeModalOpen(true)}
          >
            ⚙
          </button>
        </div>

        {sizesState.length === 0 ? (
          <p className="productFormEmpty">No hay talles cargados en la base.</p>
        ) : (
          <div className="productFormStockGrid">
            {sizesState.map((size, index) => (
              <div key={size.id} className="productFormStockRow">
                <input type="hidden" name={`stockSizeId_${index}`} value={size.id} />
                <input
                  className="productFormInput"
                  value={`US ${size.usSize} - EUR ${size.eurSize} - CM ${size.cmSize}`}
                  readOnly
                />
                <input
                  className="productFormInput"
                  name={`stockQty_${index}`}
                  type="number"
                  min="0"
                  value={existingStockQuantities[size.id] ?? "0"}
                  onChange={(event) => updateExistingStockQuantity(size.id, event.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="productFormActions">
        <SubmitButton label={editingProduct ? "Actualizar producto" : "Crear producto"} />
        {!editingProduct ? (
          <button type="button" className="productFormSecondaryButton" onClick={resetCreateForm}>
            Limpiar
          </button>
        ) : null}
      </div>

      {state.message ? (
        <p className={state.ok ? "productFormStateMsg" : "productFormStateMsg productFormStateMsgError"}>
          {state.message}
        </p>
      ) : null}

      <SizeManagerModal
        isOpen={isSizeModalOpen}
        initialItems={sizesState}
        onClose={() => setIsSizeModalOpen(false)}
        onItemsChange={handleSizesChange}
      />
    </form>
  );
}
