import { Package } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface ProductImageProps {
  sku: string
  imageUrl?: string | null
  /** Usually the product name. */
  alt: string
  /** Size and shape, e.g. "size-10" (default) or "size-40 rounded-xl". */
  className?: string
}

/** Placeholder image per SKU, so every product looks different but stable. */
function picsumUrl(sku: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(sku)}/400/400`
}

/**
 * Product picture with fallbacks: imageUrl → picsum image seeded by SKU → lucide Package icon.
 * Each source that fails to load is skipped.
 */
export function ProductImage({ sku, imageUrl, alt, className }: ProductImageProps) {
  const [failedSources, setFailedSources] = useState<string[]>([])

  const sources = [imageUrl, picsumUrl(sku)].filter((src): src is string => Boolean(src))
  const src = sources.find((candidate) => !failedSources.includes(candidate))
  const boxClasses = cn("size-10 shrink-0 overflow-hidden rounded-md bg-muted", className)

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex items-center justify-center text-muted-foreground", boxClasses)}
      >
        <Package className="size-1/2" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("object-cover", boxClasses)}
      onError={() => setFailedSources((failed) => [...failed, src])}
    />
  )
}
