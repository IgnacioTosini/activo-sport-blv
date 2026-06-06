import { SurfaceType } from "@prisma/client";
import { surfaceTypeLabel } from "@/utils/glossary";

export const ALL_BRANDS = "TODAS";
export const ALL_SURFACES = "TODA CANCHA";

export const SURFACE_OPTIONS = [
  { key: "ALL", label: ALL_SURFACES },
  { key: SurfaceType.FG, label: surfaceTypeLabel.FG },
  { key: SurfaceType.TF, label: surfaceTypeLabel.TF },
  { key: SurfaceType.SG, label: surfaceTypeLabel.SG },
  { key: SurfaceType.AG, label: surfaceTypeLabel.AG },
] as const;

export type SurfaceOptionKey = (typeof SURFACE_OPTIONS)[number]["key"];
