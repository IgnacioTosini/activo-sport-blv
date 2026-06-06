import React, { useState, useRef, useEffect } from 'react';
import { useImageOptimizer, type ImageOptimizationOptions } from '@/hooks/useImageOptimizer';
import Image from 'next/image';
import './_imageOptimizer.scss';

interface ImageOptimizerPreviewProps {
    onImageOptimized?: (file: File, stats: { originalSize: number; optimizedSize: number; compressionRatio: number }) => void;
    onImageSelected?: (file: File) => void;
    options?: ImageOptimizationOptions;
    showPreview?: boolean;
    className?: string;
    initialImageUrl?: string; // Para mostrar imagen existente al editar
    resetSignal?: number;
    onClearSelection?: () => void;
}

export const ImageOptimizerPreview: React.FC<ImageOptimizerPreviewProps> = ({
    onImageOptimized,
    onImageSelected,
    options = {},
    showPreview = true,
    className = '',
    initialImageUrl,
    resetSignal,
    onClearSelection
}) => {
    const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
    const [, setOptimizationStats] = useState<{
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { optimizeImage, isOptimizing } = useImageOptimizer();

    // Efecto para resetear el componente cuando cambia initialImageUrl
    useEffect(() => {
        setPreview(initialImageUrl || null);
        setOptimizationStats(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [initialImageUrl]);

    useEffect(() => {
        setOptimizationStats(null);
        setPreview(initialImageUrl || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [resetSignal, initialImageUrl]);

    const defaultOptions: ImageOptimizationOptions = {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.9,
        format: 'webp',
        maxSizeKB: 300,
        ...options
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        onImageSelected?.(file);

        // Crear preview del archivo original temporalmente
        const originalPreview = URL.createObjectURL(file);
        setPreview(originalPreview);

        try {
            const result = await optimizeImage(file, defaultOptions);

            setOptimizationStats({
                originalSize: result.originalSize,
                optimizedSize: result.optimizedSize,
                compressionRatio: result.compressionRatio
            });

            setPreview(result.preview);

            onImageOptimized?.(result.file, {
                originalSize: result.originalSize,
                optimizedSize: result.optimizedSize,
                compressionRatio: result.compressionRatio
            });

        } catch (error) {
            console.error("Error al optimizar imagen:", error);

            if (preview) {
                URL.revokeObjectURL(preview);
            }

            setPreview(initialImageUrl || null);
            setOptimizationStats(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const clearSelection = () => {
        setOptimizationStats(null);
        if (preview && preview !== initialImageUrl) {
            URL.revokeObjectURL(preview);
        }
        setPreview(initialImageUrl || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClearSelection?.();
        // NO enviar archivo vacío, solo limpiar estados locales
    };

    return (
        <div className={`imageOptimizer ${className}`}>
            <div className="imageOptimizerMain">
                <div className="imageOptimizerUpload">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="imageOptimizerInput"
                        id="imageOptimizerPreviewInput"
                        disabled={isOptimizing}
                    />
                    <label htmlFor="imageOptimizerPreviewInput" className="imageOptimizerLabel">
                        {isOptimizing ? (
                            <div className="imageOptimizerLoading">
                                <div className="spinner"></div>
                                <span>Optimizando imagen...</span>
                            </div>
                        ) : (
                            <>
                                <div className="imageOptimizerIcon">📸</div>
                                <div className="imageOptimizerText">
                                    <strong>Seleccionar imagen</strong>
                                    <p>Se optimizará automáticamente (sin subir aún)</p>
                                </div>
                            </>
                        )}
                    </label>
                </div>

                {showPreview && preview && (
                    <div className="imageOptimizerPreview">
                        <Image src={preview} alt="Preview" className="previewImage" width={200} height={200} />
                        {preview !== initialImageUrl && (
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="clearButton"
                                aria-label="Quitar imagen"
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
