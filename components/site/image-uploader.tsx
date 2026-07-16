'use client'

import { useRef } from 'react'
import { Plus, X } from 'lucide-react'

interface ImageUploaderProps {
  /** Current image URL value (for single-image use) */
  imageUrl?: string
  /** Called when a new image has been uploaded — receives the full URL returned by backend */
  onUploaded: (url: string) => void
  /** Called when the current image is removed */
  onRemove?: () => void
  /** Label shown above the picker (optional) */
  label?: string
  /** Whether an upload is in progress (external state — passed from parent) */
  uploading: boolean
  setUploading: (v: boolean) => void
  /** Upload function: receives a File and returns { url: string } */
  uploadFn: (file: File) => Promise<{ url: string }>
}

/**
 * A single-image uploader used across all admin sections.
 * Shows a "+/Ajouter" dashed box when no image is selected,
 * and a preview thumbnail with a "×" removal button when an image is set.
 */
export function ImageUploader({
  imageUrl,
  onUploaded,
  onRemove,
  label = 'Image',
  uploading,
  setUploading,
  uploadFn,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await uploadFn(file)
      if (data.url) onUploaded(data.url)
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi de l'image.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-4">
        {/* Preview thumbnail */}
        {imageUrl && (
          <div className="relative size-24 rounded-xl border border-border bg-secondary/50 overflow-hidden group shrink-0">
            <img
              src={imageUrl}
              alt="Aperçu"
              className="size-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/placeholder.png'
              }}
            />
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                title="Supprimer l'image"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        {/* Upload box */}
        {!imageUrl && (
          <label className="relative size-24 rounded-xl border-2 border-dashed border-border hover:border-gold/60 bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center cursor-pointer group">
            {uploading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            ) : (
              <>
                <Plus className="size-6 text-muted-foreground group-hover:text-gold transition-colors" />
                <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">
                  Ajouter
                </span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}

        {/* Re-upload button (shown after image is set) */}
        {imageUrl && (
          <label className="relative size-16 rounded-xl border-2 border-dashed border-border hover:border-gold/60 bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center cursor-pointer group">
            {uploading ? (
              <div className="size-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            ) : (
              <>
                <Plus className="size-5 text-muted-foreground group-hover:text-gold transition-colors" />
                <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">
                  Changer
                </span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────────────────
 * MultiImageUploader — for product pages that need multiple images
 * ─────────────────────────────────────────────────────────────────────────── */
interface MultiImageUploaderProps {
  imageUrls: string[]
  onAdd: (url: string) => void
  onRemove: (index: number) => void
  uploading: boolean
  setUploading: (v: boolean) => void
  uploadFn: (file: File) => Promise<{ url: string }>
  label?: string
}

export function MultiImageUploader({
  imageUrls,
  onAdd,
  onRemove,
  uploading,
  setUploading,
  uploadFn,
  label = 'Images du produit',
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await uploadFn(file)
      if (data.url) onAdd(data.url)
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi de l'image.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-4">
        {/* Previews */}
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className="relative size-24 rounded-xl border border-border bg-secondary/50 overflow-hidden group shrink-0"
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="size-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/placeholder.png'
              }}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
              title="Supprimer cette image"
            >
              <X className="size-3" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] bg-gold text-walnut font-bold uppercase tracking-wider">
                Principal
              </span>
            )}
          </div>
        ))}

        {/* Add button */}
        <label className="relative size-24 rounded-xl border-2 border-dashed border-border hover:border-gold/60 bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center cursor-pointer group">
          {uploading ? (
            <div className="size-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          ) : (
            <>
              <Plus className="size-6 text-muted-foreground group-hover:text-gold transition-colors" />
              <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">
                Ajouter
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
