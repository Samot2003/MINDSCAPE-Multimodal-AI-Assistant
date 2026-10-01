/**
 * Reduce una imagen para enviarla al backend en cada mensaje (el modelo la usa a 512 px).
 * @param {Blob} image - Imagen original.
 * @param {number} maxSize - Lado máximo en píxeles.
 * @returns {Promise<Blob>} Imagen JPEG reducida (o la original si no se puede procesar).
 */
export const shrinkImage = async (image, maxSize = 1024) => {
  try {
    const bitmap = await createImageBitmap(image);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob || image;
  } catch {
    return image;
  }
};
