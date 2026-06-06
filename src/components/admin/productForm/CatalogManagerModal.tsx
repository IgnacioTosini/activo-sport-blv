"use client";

import { useEffect, useMemo, useState } from "react";

type CatalogType = "brand" | "category";

type CatalogItem = {
  id: string;
  name: string;
};

type CatalogManagerModalProps = {
  isOpen: boolean;
  type: CatalogType;
  initialItems: string[];
  onClose: () => void;
  onItemsChange: (names: string[]) => void;
  onPick: (name: string) => void;
};

type ApiListResponse = {
  ok: boolean;
  items?: CatalogItem[];
  message?: string;
};

export function CatalogManagerModal({
  isOpen,
  type,
  initialItems,
  onClose,
  onItemsChange,
  onPick,
}: CatalogManagerModalProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const title = useMemo(() => (type === "brand" ? "ABM Marcas" : "ABM Categorias"), [type]);

  const refresh = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/catalog?type=${type}`, { method: "GET" });
      const data = (await response.json()) as ApiListResponse;

      if (!response.ok || !data.ok || !data.items) {
        throw new Error(data.message || "No se pudo cargar el catalogo.");
      }

      setItems(data.items);
      onItemsChange(data.items.map((item) => item.name));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
      setItems(initialItems.map((name) => ({ id: `local-${name}`, name })));
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    refresh();
  }, [isOpen, type]);

  const createItem = async () => {
    if (!newName.trim()) {
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name: newName.trim() }),
      });

      const data = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear.");
      }

      setNewName("");
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id: editingId, name: editingName.trim() }),
      });

      const data = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar.");
      }

      setEditingId(null);
      setEditingName("");
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteItem = async (id: string) => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });

      const data = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo eliminar.");
      }

      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="catalogModalOverlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="catalogModalCard">
        <div className="catalogModalHeader">
          <h3>{title}</h3>
          <button type="button" className="productFormSecondaryButton" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="catalogModalCreateRow">
          <input
            className="productFormInput"
            placeholder={type === "brand" ? "Nueva marca" : "Nueva categoria"}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            disabled={isBusy}
          />
          <button type="button" className="productFormPrimaryButton" onClick={createItem} disabled={isBusy}>
            Agregar
          </button>
        </div>

        {errorMessage ? <p className="productFormStateMsgError">{errorMessage}</p> : null}

        <div className="catalogModalList">
          {items.length === 0 ? (
            <p className="productFormEmpty">No hay registros.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="catalogModalItem">
                {editingId === item.id ? (
                  <input
                    className="productFormInput"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    disabled={isBusy}
                  />
                ) : (
                  <span>{item.name}</span>
                )}

                <div className="catalogModalActions">
                  <button
                    type="button"
                    className="productFormSecondaryButton"
                    onClick={() => {
                      onPick(item.name);
                      onClose();
                    }}
                    disabled={isBusy}
                  >
                    Usar
                  </button>

                  {editingId === item.id ? (
                    <button
                      type="button"
                      className="productFormPrimaryButton"
                      onClick={saveEdit}
                      disabled={isBusy}
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="productFormSecondaryButton"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.name);
                      }}
                      disabled={isBusy}
                    >
                      Editar
                    </button>
                  )}

                  <button
                    type="button"
                    className="productFormDangerInlineButton"
                    onClick={() => deleteItem(item.id)}
                    disabled={isBusy}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
