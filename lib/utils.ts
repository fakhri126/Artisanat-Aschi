import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isBijouxOrHandleCategory(name: string | null | undefined): boolean {
  if (!name) return false
  const n = name.toLowerCase().trim()
  return (
    n.includes('bijou') ||
    n.includes('poignée') ||
    n.includes('poignee') ||
    n.includes('bouton') ||
    n.includes('ronds') ||
    n.includes('ovales') ||
    n === 'cuivre' ||
    n.includes('poignée céramique') ||
    n.includes('poignée sculptée') ||
    n.includes('poignée en cuivre') ||
    n.includes('petites poignées') ||
    n.includes('grands ronds')
  )
}

export function isBijouxOrHandleProduct(p: { name?: string; category?: { name?: string }; materials?: string }): boolean {
  const catName = p.category?.name?.toLowerCase() || ''
  const prodName = (p.name || '').toLowerCase()
  const mat = (p.materials || '').toLowerCase()

  if (isBijouxOrHandleCategory(catName)) return true

  const isHandleName = (
    prodName.includes('bijou') ||
    prodName.includes('poignée') ||
    prodName.includes('poignee') ||
    prodName.includes('bouton de porte') ||
    prodName.includes('bouton') ||
    prodName.includes('grand rond') ||
    prodName.includes('ovale')
  )

  const isCeramicHandle = (
    (mat.includes('céramique') || mat.includes('majolique')) &&
    (prodName.includes('poignée') || prodName.includes('bouton') || prodName.includes('rond') || prodName.includes('ovale') || catName.includes('bijou') || catName.includes('poignée'))
  )

  return isHandleName || isCeramicHandle
}

