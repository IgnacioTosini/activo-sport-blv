import React, { useState, useRef } from 'react';
import { useImageOptimizer, type ImageOptimizationOptions } from '@/hooks/useImageOptimizer';
import Image from 'next/image';
import './_imageOptimizer.scss';

interface ImageOptimizerProps {
    onImageOptimized?: (file: File, stats: { originalSize: number; optimizedSize: number; compressionRatio: number }) => void;
    onImageSelected?: (file: File) => void;
    options?: ImageOptimizationOptions;
    showPreview?: boolean;
    className?: string;
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
    onImageOptimized,
    onImageSelected,
    options = {},
    showPreview = true,
    className = ''
}) => {
    const [preview, setPreview] = useState<string | null>(null);
    // Removed unused originalFile state
    const [optimizationStats, setOptimizationStats] = useState<{
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { optimizeImage, isOptimizing } = useImageOptimizer();

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

        // Crear preview del archivo original
        const originalPreview = URL.createObjectURL(file);
        setPreview(originalPreview);

        try {
            // Optimizar la imagen
            const result = await optimizeImage(file, defaultOptions);

            // Actualizar estadísticas
            setOptimizationStats({
                originalSize: result.originalSize,
                optimizedSize: result.optimizedSize,
                compressionRatio: result.compressionRatio
            });

            // Actualizar preview con imagen optimizada
            if (showPreview) {
                URL.revokeObjectURL(originalPreview);
                setPreview(result.preview);
            }

            // Notificar al componente padre
            onImageOptimized?.(result.file, {
                originalSize: result.originalSize,
                optimizedSize: result.optimizedSize,
                compressionRatio: result.compressionRatio
            });

        } catch (error) {
            console.error('Error al optimizar imagen:', error);
            // En caso de error, usar archivo original
            onImageOptimized?.(file, {
                originalSize: file.size,
                optimizedSize: file.size,
                compressionRatio: 0
            });
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const clearSelection = () => {
        setOptimizationStats(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`imageOptimizer ${className}`}>
            <div className="imageOptimizerUpload">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="imageOptimizerInput"
                    id="imageOptimizerInput"
                    disabled={isOptimizing}
                />
                <label htmlFor="imageOptimizerInput" className="imageOptimizerLabel">
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
                                <p>Se optimizará automáticamente antes de subir</p>
                            </div>
                        </>
                    )}
                </label>
            </div>

            {showPreview && preview && (
                <div className="imageOptimizerPreview">
                    <Image src={preview} alt="Preview" className="previewImage" width={200} height={200} />
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="clearButton"
                        aria-label="Quitar imagen"
                    >
                        ×
                    </button>
                </div>
            )}

            {optimizationStats && (
                <div className="imageOptimizerStats">
                    <h4>📊 Estadísticas de Optimización</h4>
                    <div className="statsGrid">
                        <div className="statItem">
                            <span className="statLabel">Tamaño original:</span>
                            <span className="statValue">{formatFileSize(optimizationStats.originalSize)}</span>
                        </div>
                        <div className="statItem">
                            <span className="statLabel">Tamaño optimizado:</span>
                            <span className="statValue">{formatFileSize(optimizationStats.optimizedSize)}</span>
                        </div>
                        <div className="statItem success">
                            <span className="statLabel">Reducción:</span>
                            <span className="statValue">{optimizationStats.compressionRatio}%</span>
                        </div>
                    </div>

                    <div className="optimizationDetails">
                        <p><strong>Configuración aplicada:</strong></p>
                        <ul>
                            <li>Tamaño máximo: {defaultOptions.maxWidth}×{defaultOptions.maxHeight}px</li>
                            <li>Calidad: {Math.round((defaultOptions.quality || 0.8) * 100)}%</li>
                            <li>Formato: {defaultOptions.format?.toUpperCase()}</li>
                            <li>Peso máximo: {defaultOptions.maxSizeKB}KB</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};