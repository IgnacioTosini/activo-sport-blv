'use client';

import { useEffect, useState } from 'react';
import { CiRuler } from 'react-icons/ci'
import { IoIosInformationCircleOutline } from 'react-icons/io';
import './_sizeModal.scss'

type SizeModalProps = {
    onClose: () => void;
    isOpen: boolean;
};

type SizeRow = {
    id: string;
    usSize: number;
    eurSize: number;
    cmSize: number;
};

export const SizeModal = ({ onClose, isOpen }: SizeModalProps) => {
    const [sizes, setSizes] = useState<SizeRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onClose]);

    useEffect(() => {
        let isMounted = true;

        const loadSizes = async () => {
            try {
                const response = await fetch('/api/sizes', { cache: 'no-store' });
                const data = (await response.json()) as { ok?: boolean; sizes?: SizeRow[]; message?: string };

                if (!response.ok || !data.ok) {
                    throw new Error(data.message ?? 'No se pudo cargar la guia de talles.');
                }

                if (isMounted) {
                    setSizes(data.sizes ?? []);
                    setErrorMessage('');
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar la guia de talles.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSizes();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className={`sizeModal ${isOpen ? 'isOpen' : 'isClosing'}`} onClick={onClose}>
            <div
                className={`sizeModalContent ${isOpen ? 'isOpen' : 'isClosing'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="size-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button type="button" className="sizeModalCloseButton" onClick={onClose} aria-label="Cerrar modal de guia de talles">X</button>
                <div className="sizeModalContentHeader">
                    <span><CiRuler />Encontrá tu talle exacto</span>
                    <h1 id="size-modal-title">GUÍA DE TALLES</h1>
                </div>
                <div className="sizeModalContentBody">
                    <p>Para encontrar tu talle exacto, te recomendamos seguir estos pasos:</p>
                    <ul>
                        <li>Apoyá el pie descalzo sobre una hoja A4 contra la pared.</li>
                        <li>Marcá con un lápiz la punta del dedo más largo.</li>
                        <li>Medí desde la pared hasta la marca, en centímetros.</li>
                        <li>Sumá 0.5 cm de margen y buscá tu CM en la tabla.</li>
                    </ul>
                    <p className='sizeModalInfo'><IoIosInformationCircleOutline /> Medí los dos pies al final del día (suelen estar más hinchados) y usá la medida del más grande.</p>
                </div>

                <table className="sizeModalTable">
                    <thead>
                        <tr>
                            <th>US</th>
                            <th>EU</th>
                            <th>CM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={3}>Cargando talles...</td>
                            </tr>
                        ) : errorMessage ? (
                            <tr>
                                <td colSpan={3}>{errorMessage}</td>
                            </tr>
                        ) : sizes.length === 0 ? (
                            <tr>
                                <td colSpan={3}>No hay talles disponibles.</td>
                            </tr>
                        ) : (
                            sizes.map((size) => (
                                <tr key={size.id}>
                                    <td>{size.usSize}</td>
                                    <td>{size.eurSize}</td>
                                    <td>{size.cmSize}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
