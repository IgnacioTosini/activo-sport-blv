"use client";

import { useEffect, useState } from "react";
import "./_sizeManager.scss";

type SizeOption = {
    id: string;
    usSize: number;
    eurSize: number;
    cmSize: number;
};

type SizeManagerModalProps = {
    isOpen: boolean;
    initialItems: SizeOption[];
    onClose: () => void;
    onItemsChange: (items: SizeOption[]) => void;
};

type ApiListResponse = {
    ok: boolean;
    items?: SizeOption[];
    message?: string;
};

type SizeDraft = {
    usSize: string;
    eurSize: string;
    cmSize: string;
};

const EMPTY_DRAFT: SizeDraft = {
    usSize: "",
    eurSize: "",
    cmSize: "",
};

function toDraft(item: SizeOption): SizeDraft {
    return {
        usSize: String(item.usSize),
        eurSize: String(item.eurSize),
        cmSize: String(item.cmSize),
    };
}

function parsePositive(value: string): number | null {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

function sizeLabel(item: SizeOption) {
    return `US ${item.usSize} - EUR ${item.eurSize} - CM ${item.cmSize}`;
}

export function SizeManagerModal({ isOpen, initialItems, onClose, onItemsChange }: SizeManagerModalProps) {
    const [items, setItems] = useState<SizeOption[]>([]);
    const [newDraft, setNewDraft] = useState<SizeDraft>(EMPTY_DRAFT);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingDraft, setEditingDraft] = useState<SizeDraft>(EMPTY_DRAFT);
    const [errorMessage, setErrorMessage] = useState("");
    const [isBusy, setIsBusy] = useState(false);

    const refresh = async () => {
        setIsBusy(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/sizes", { method: "GET" });
            const data = (await response.json()) as ApiListResponse;

            if (!response.ok || !data.ok || !data.items) {
                throw new Error(data.message || "No se pudo cargar el listado de talles.");
            }

            setItems(data.items);
            onItemsChange(data.items);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
            setItems(initialItems);
        } finally {
            setIsBusy(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        refresh();
    }, [isOpen]);

    const updateDraft = (field: keyof SizeDraft, value: string, mode: "new" | "edit") => {
        if (mode === "new") {
            setNewDraft((prev) => ({ ...prev, [field]: value }));
            return;
        }

        setEditingDraft((prev) => ({ ...prev, [field]: value }));
    };

    const createSize = async () => {
        const usSize = parsePositive(newDraft.usSize);
        const eurSize = parsePositive(newDraft.eurSize);
        const cmSize = parsePositive(newDraft.cmSize);

        if (usSize === null || eurSize === null || cmSize === null) {
            setErrorMessage("Completa US, EUR y CM con valores mayores a 0.");
            return;
        }

        setIsBusy(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/sizes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usSize, eurSize, cmSize }),
            });

            const data = (await response.json()) as { ok: boolean; message?: string };
            if (!response.ok || !data.ok) {
                throw new Error(data.message || "No se pudo crear el talle.");
            }

            setNewDraft(EMPTY_DRAFT);
            await refresh();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
        } finally {
            setIsBusy(false);
        }
    };

    const saveEdit = async () => {
        if (!editingId) {
            return;
        }

        const usSize = parsePositive(editingDraft.usSize);
        const eurSize = parsePositive(editingDraft.eurSize);
        const cmSize = parsePositive(editingDraft.cmSize);

        if (usSize === null || eurSize === null || cmSize === null) {
            setErrorMessage("Completa US, EUR y CM con valores mayores a 0.");
            return;
        }

        setIsBusy(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/sizes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingId, usSize, eurSize, cmSize }),
            });

            const data = (await response.json()) as { ok: boolean; message?: string };
            if (!response.ok || !data.ok) {
                throw new Error(data.message || "No se pudo actualizar el talle.");
            }

            setEditingId(null);
            setEditingDraft(EMPTY_DRAFT);
            await refresh();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error inesperado.");
        } finally {
            setIsBusy(false);
        }
    };

    const deleteSize = async (id: string) => {
        setIsBusy(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/sizes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = (await response.json()) as { ok: boolean; message?: string };
            if (!response.ok || !data.ok) {
                throw new Error(data.message || "No se pudo eliminar el talle.");
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
        <div className="sizeManagerOverlay" role="dialog" aria-modal="true" aria-label="ABM Talles">
            <div className="sizeManagerCard">
                <div className="sizeManagerHeader">
                    <h3>ABM Talles</h3>
                    <button type="button" className="productFormSecondaryButton" onClick={onClose}>
                        Cerrar
                    </button>
                </div>

                <p className="sizeManagerHint">Cambia los numeros de cada talle (US, EUR y CM) cuando lo necesites.</p>

                <div className="sizeManagerCreateRow">
                    <input
                        className="productFormInput"
                        placeholder="US"
                        value={newDraft.usSize}
                        onChange={(event) => updateDraft("usSize", event.target.value, "new")}
                        disabled={isBusy}
                        type="number"
                        step="0.5"
                        min="0"
                    />
                    <input
                        className="productFormInput"
                        placeholder="EUR"
                        value={newDraft.eurSize}
                        onChange={(event) => updateDraft("eurSize", event.target.value, "new")}
                        disabled={isBusy}
                        type="number"
                        step="0.5"
                        min="0"
                    />
                    <input
                        className="productFormInput"
                        placeholder="CM"
                        value={newDraft.cmSize}
                        onChange={(event) => updateDraft("cmSize", event.target.value, "new")}
                        disabled={isBusy}
                        type="number"
                        step="0.5"
                        min="0"
                    />
                    <button type="button" className="productFormPrimaryButton" onClick={createSize} disabled={isBusy}>
                        Agregar
                    </button>
                </div>

                {errorMessage ? <p className="productFormStateMsgError">{errorMessage}</p> : null}

                <div className="sizeManagerList">
                    {items.length === 0 ? (
                        <p className="productFormEmpty">No hay talles cargados.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="sizeManagerItem">
                                {editingId === item.id ? (
                                    <div className="sizeManagerEditGrid">
                                        <input
                                            className="productFormInput"
                                            value={editingDraft.usSize}
                                            onChange={(event) => updateDraft("usSize", event.target.value, "edit")}
                                            disabled={isBusy}
                                            type="number"
                                            step="0.5"
                                            min="0"
                                        />
                                        <input
                                            className="productFormInput"
                                            value={editingDraft.eurSize}
                                            onChange={(event) => updateDraft("eurSize", event.target.value, "edit")}
                                            disabled={isBusy}
                                            type="number"
                                            step="0.5"
                                            min="0"
                                        />
                                        <input
                                            className="productFormInput"
                                            value={editingDraft.cmSize}
                                            onChange={(event) => updateDraft("cmSize", event.target.value, "edit")}
                                            disabled={isBusy}
                                            type="number"
                                            step="0.5"
                                            min="0"
                                        />
                                    </div>
                                ) : (
                                    <span>{sizeLabel(item)}</span>
                                )}

                                <div className="sizeManagerActions">
                                    {editingId === item.id ? (
                                        <button type="button" className="productFormPrimaryButton" onClick={saveEdit} disabled={isBusy}>
                                            Guardar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="productFormSecondaryButton"
                                            onClick={() => {
                                                setEditingId(item.id);
                                                setEditingDraft(toDraft(item));
                                            }}
                                            disabled={isBusy}
                                        >
                                            Editar
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="productFormDangerInlineButton"
                                        onClick={() => deleteSize(item.id)}
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
