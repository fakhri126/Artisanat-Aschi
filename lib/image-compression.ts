/**
 * Client-side image compression utility using HTML5 Canvas.
 * Automatically resizes large images and encodes them to optimized WebP.
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  mimeType: 'image/webp',
}

/**
 * Compresses an image File in the browser.
 * Returns a new compressed File (usually WebP), or the original file if compression isn't applicable.
 */
export async function compressImage(
  file: File,
  customOptions?: Partial<CompressionOptions>
): Promise<File> {
  // If not in a browser environment or not an image, return untouched
  if (typeof window === 'undefined' || !file || !file.type.startsWith('image/')) {
    return file
  }

  // Preserve vector SVGs and animated GIFs
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }

  const options = { ...DEFAULT_OPTIONS, ...customOptions }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        try {
          let { width, height } = img

          // Calculate aspect-ratio-preserving dimensions
          const maxW = options.maxWidth!
          const maxH = options.maxHeight!

          if (width > maxW || height > maxH) {
            if (width / height > maxW / maxH) {
              height = Math.round((height * maxW) / width)
              width = maxW
            } else {
              width = Math.round((width * maxH) / height)
              height = maxH
            }
          }

          // Create canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(file)
            return
          }

          // High-quality downsampling
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          const targetMime = options.mimeType || 'image/webp'

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file)
                return
              }

              // Only substitute if the compressed version is smaller or if format was changed
              if (blob.size < file.size || file.type !== targetMime) {
                const baseName = file.name.replace(/\.[^/.]+$/, '')
                const ext = targetMime === 'image/webp' ? '.webp' : '.jpg'
                const compressedFile = new File([blob], `${baseName}${ext}`, {
                  type: targetMime,
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            targetMime,
            options.quality
          )
        } catch (err) {
          console.warn('Image canvas compression failed, using original file:', err)
          resolve(file)
        }
      }

      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }

    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
