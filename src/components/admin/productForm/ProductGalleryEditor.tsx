import Image from "next/image";
import { GalleryImageItem } from "./productForm.utils";
import { validateImageDimensions } from "@/helpers/cloudinary/validateImageDimensions";

type ProductGalleryEditorProps = {
  items: GalleryImageItem[];
  onReplace: (id: string, file: File) => void;
  onRemove: (id: string) => void;
};

export function ProductGalleryEditor({ items, onReplace, onRemove }: ProductGalleryEditorProps) {
  return (
    <div className="productFormGalleryEditor">
      <p className="productFormMediaTitle">Galeria actual del producto</p>
      {items.length === 0 ? (
        <p className="productFormEmpty">No hay imagenes en la galeria.</p>
      ) : (
        <div className="productFormGalleryGrid">
          {items.map((item, index) => (
            <article key={item.id} className="productFormGalleryItem">
              <Image
                src={item.url}
                alt={`Imagen ${index + 1} de galeria`}
                width={180}
                height={120}
                className="productFormGalleryThumb"
                unoptimized
              />
              {item.isReplacementPending ? (
                <span className="productFormGalleryPendingBadge">Cambio pendiente (se sube al actualizar)</span>
              ) : null}
              <div className="productFormGalleryActions">
                <label className="productFormSecondaryButton productFormGalleryReplaceButton">
                  Cambiar
                  <input
                    type="file"
                    accept="image/*"
                    className="productFormGalleryReplaceInput"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];

                      if (!file) return;

                      const isValid =
                        await validateImageDimensions(file);

                      if (!isValid) {
                        event.currentTarget.value = "";
                        return;
                      }

                      onReplace(item.id, file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="productFormDangerInlineButton"
                  onClick={() => onRemove(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
