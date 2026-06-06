import { prisma } from "@/lib/prisma";

export async function fetchBrands() {
    try {
        const response = await prisma.brand.findMany({
            orderBy: {
                name: "asc",
            },
        });
        return response;
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}