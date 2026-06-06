import { prisma } from "@/lib/prisma"

export const getAllSizes = async () => {
    return prisma.size.findMany({
        orderBy: { usSize: "asc" },
    });
};