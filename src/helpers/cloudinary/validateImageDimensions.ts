import { toast } from "react-toastify";

const MIN_WIDTH = 1280;
const MIN_HEIGHT = 720;

export async function validateImageDimensions(
    file: File
): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            if (
                img.width < MIN_WIDTH ||
                img.height < MIN_HEIGHT
            ) {
                toast.warning(
                    `La imagen "${file.name}" tiene ${img.width}x${img.height}px. Se recomienda al menos ${MIN_WIDTH}x${MIN_HEIGHT}px.`
                );

                resolve(false);
                return;
            }

            resolve(true);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(false);
        };

        img.src = url;
    });
}