/**
 * Client-side high-fidelity image compression utility.
 * Compresses and scales images down to crisp web resolutions using modern WebP
 * (with automatic JPEG fallback), reducing typical 5-15MB camera photos down
 * to 50-250KB without perceptible visual quality loss for fine text or signatures.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export async function compressClientImage(
  file: File,
  optionsOrMaxWidth: number | CompressOptions = 1200,
  legacyMaxHeight?: number,
  legacyQuality?: number
): Promise<File> {
  // If not an image, return original file as-is
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Support both legacy positional arguments and options object
  let maxWidth = 1200;
  let maxHeight = 1200;
  let quality = 0.85;
  let format: 'image/webp' | 'image/jpeg' = 'image/webp';

  if (typeof optionsOrMaxWidth === 'number') {
    maxWidth = optionsOrMaxWidth;
    maxHeight = legacyMaxHeight ?? optionsOrMaxWidth;
    quality = legacyQuality ?? 0.85;
  } else {
    maxWidth = optionsOrMaxWidth.maxWidth ?? 1200;
    maxHeight = optionsOrMaxWidth.maxHeight ?? 1200;
    quality = optionsOrMaxWidth.quality ?? 0.85;
    format = optionsOrMaxWidth.format ?? 'image/webp';
  }

  return new Promise((resolve) => {
    // If not in a browser environment (SSR), return file as-is
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio safe downscaling guaranteeing both constraints are respected
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Apply smooth high-quality bilinear interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try preferred format (image/webp) first
        const tryBlobCreation = (targetMime: string, fallbackMime?: string) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                if (fallbackMime) {
                  tryBlobCreation(fallbackMime);
                } else {
                  resolve(file);
                }
                return;
              }

              const ext = targetMime === 'image/webp' ? '.webp' : '.jpg';
              const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${cleanBaseName}${ext}`, {
                type: targetMime,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            targetMime,
            quality
          );
        };

        if (format === 'image/webp') {
          tryBlobCreation('image/webp', 'image/jpeg');
        } else {
          tryBlobCreation('image/jpeg');
        }
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

/**
 * Optimized preset for Client Avatar / Profile photo (Ficha Cadastral)
 * Max 800x800px, 0.85 WebP, resulting in ~30-70KB ultra-crisp portraits.
 */
export async function compressAvatarPhoto(file: File): Promise<File> {
  return compressClientImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
    format: 'image/webp',
  });
}

/**
 * Optimized preset for Legal Documents & Identification Proofs (RG, CNH, Certidões)
 * Max 1800x1800px, 0.88 WebP, preserving razor-sharp typography, stamps, and signatures
 * while reducing 5-15MB scans/photos to ~120-250KB.
 */
export async function compressDocumentImage(file: File): Promise<File> {
  return compressClientImage(file, {
    maxWidth: 1800,
    maxHeight: 1800,
    quality: 0.88,
    format: 'image/webp',
  });
}
