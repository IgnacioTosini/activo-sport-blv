export function cloudinaryImage(
    url: string,
    width = 1280,
    height = 720
) {
    return url.replace(
        "/upload/",
        `/upload/c_fill,g_auto,w_${width},h_${height},q_auto,f_auto/`
    );
}