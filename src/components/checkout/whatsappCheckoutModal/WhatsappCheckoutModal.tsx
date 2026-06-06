"use client";

import { useEffect, useState } from "react";
import { CheckoutData } from "@/types/checkout.types";
import "./_whatsappCheckoutModal.scss";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CheckoutData) => Promise<void>;
};

export const WhatsappCheckoutModal = ({
    open,
    onClose,
    onSubmit,
}: Props) => {
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        try {
            const stored = localStorage.getItem("checkout-data");

            if (!stored) return;

            const parsed: CheckoutData = JSON.parse(stored);

            setCustomerName(parsed.customerName ?? "");
            setPhone(parsed.phone ?? "");
            setNotes(parsed.notes ?? "");
        } catch {
            console.error("Error leyendo checkout-data");
        }
    }, [open]);

    const handleSubmit = async () => {
        setError("");

        if (!customerName.trim()) {
            setError("Ingresa tu nombre.");
            return;
        }

        if (!phone.trim()) {
            setError("Ingresa tu número de WhatsApp.");
            return;
        }

        try {
            setLoading(true);

            localStorage.setItem(
                "checkout-data",
                JSON.stringify({
                    customerName,
                    phone,
                    notes,
                })
            );

            await onSubmit({
                customerName,
                phone,
                notes,
            });

            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocurrió un error."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="checkoutModalOverlay"
            onClick={onClose}
        >
            <div
                className="checkoutModal"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Finalizar compra</h3>

                <p className="checkoutModalDescription">
                    Completa tus datos para continuar la compra
                    por WhatsApp.
                </p>

                <input
                    value={customerName}
                    onChange={(e) =>
                        setCustomerName(e.target.value)
                    }
                    placeholder="Nombre y apellido"
                />

                <input
                    value={phone}
                    onChange={(e) =>
                        setPhone(e.target.value)
                    }
                    placeholder="5492231234567 (WhatsApp)"
                />
                <small>
                    Ingresa el número sin espacios ni guiones.
                </small>

                <textarea
                    value={notes}
                    onChange={(e) =>
                        setNotes(e.target.value)
                    }
                    placeholder="Observaciones (opcional)"
                />

                {error && (
                    <p className="checkoutModalError">
                        {error}
                    </p>
                )}

                <div className="checkoutModalActions">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? "Procesando..."
                            : "Continuar por WhatsApp"}
                    </button>
                </div>
            </div>
        </div>
    );
};