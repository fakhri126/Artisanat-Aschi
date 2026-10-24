/**
 * Compresse et convertit automatiquement toute image (JPEG, PNG, HEIC, etc.) en WebP optimisé
 * directement dans le navigateur du client avant son envoi.
 * 
 * Avantages :
 * - Poids divisé par 5 à 10 (ex: 3 Mo -> 200 Ko)
 * - Format moderne et ultra-rapide .webp
 * - Envoi instantané vers le serveur
 * - Qualité visuelle préservée (82% de qualité, résolution max 1920px)
 */

export async function convertToWebP(
  file: File,
  maxDimension: number = 1920,
  quality: number = 0.82
): Promise<File> {
  // Uniquement dans le navigateur
  if (typeof window === 'undefined') return file;

  // Préserver les fichiers vectoriels SVG et les GIFs animés
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // Traiter uniquement les images
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|bmp)$/i.test(file.name);
  if (!isImage) {
    return file;
  }

  // Si c'est déjà un WebP léger (< 500 Ko), pas besoin de le ré-encoder
  if (file.type === 'image/webp' && file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (!width || !height) {
        resolve(file);
        return;
      }

      // Redimensionnement proportionnel si l'image dépasse maxDimension (ex: 1920px)
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      // Lissage haute qualité
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export const compressImage = convertToWebP;
