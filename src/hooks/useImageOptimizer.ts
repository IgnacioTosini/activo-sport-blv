"use client";

import { useState } from "react";
import { ImageService } from "@/services/ImageService";
import { validateImageDimensions } from "@/helpers/cloudinary/validateImageDimensions";

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "webp" | "png";
  maxSizeKB?: number;
  enableOptimization?: boolean;
}

export type OptimizedImageResult = {
  file: File;
  preview: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
};

export function useImageOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImage = async (
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> => {
    setIsOptimizing(true);

    try {
      const { file: optimizedFile, stats } =
        await ImageService.optimizeImage(file, options);

      validateImageDimensions(optimizedFile);

      return {
        file: optimizedFile,
        preview: URL.createObjectURL(optimizedFile),
        originalSize: stats.originalSize,
        optimizedSize: stats.optimizedSize,
        compressionRatio: stats.compressionRatio,
      };
    } catch {
      throw new Error("Imagen no válida o error al optimizar");
    }
    finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimizeImage,
    isOptimizing,
  };
}