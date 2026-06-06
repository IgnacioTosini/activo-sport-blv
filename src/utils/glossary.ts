import { SurfaceType } from "@prisma/client";

export const surfaceTypeLabel: Record<SurfaceType, string> = {
    FG: "FG",
    TF: "TF",
    AG: "AG",
    SG: "SG",
    IC: "IC",
};

export const surfaceTypeMeaning: Record<SurfaceType, string> = {
    FG: "FIRM GROUND",
    TF: "TURF",
    AG: "ARTIFICIAL GROUND",
    SG: "SOFT GROUND",
    IC: "INDOOR COURT",
};

export const surfaceTypeDescription: Record<SurfaceType, string> = {
    FG: "Pasto natural firme. Tapones moldeados de TPU. La opcion mas versatil para canchas en buen estado.",
    TF: "Sintetico clasico, papi futbol, futbol 5. Suela de goma con tapones bajos. Comodidad y agarre.",
    AG: "Pasto sintetico de ultima generacion. Mas tapones, mejor distribucion, menos impacto en rodillas y tobillos.",
    SG: "Cancha natural blanda o humeda. Tapones de aluminio largos e intercambiables.",
    IC: "Canchas de futbol indoor, futsal o futbol 5. Suela de goma lisa o con micro tapones para mejor agarre.",
};

export const surfaceItems: Record<SurfaceType, { label: string; meaning: string; description: string }> = {
    FG: {
        label: surfaceTypeLabel.FG,
        meaning: surfaceTypeMeaning.FG,
        description: surfaceTypeDescription.FG,
    },
    TF: {
        label: surfaceTypeLabel.TF,
        meaning: surfaceTypeMeaning.TF,
        description: surfaceTypeDescription.TF,
    },
    AG: {
        label: surfaceTypeLabel.AG,
        meaning: surfaceTypeMeaning.AG,
        description: surfaceTypeDescription.AG,
    },
    SG: {
        label: surfaceTypeLabel.SG,
        meaning: surfaceTypeMeaning.SG,
        description: surfaceTypeDescription.SG,
    },
    IC: {
        label: surfaceTypeLabel.IC,
        meaning: surfaceTypeMeaning.IC,
        description: surfaceTypeDescription.IC,
    },
};