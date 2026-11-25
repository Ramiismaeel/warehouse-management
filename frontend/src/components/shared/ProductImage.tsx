import { Package } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface ProductImageProps {
  imageUrl?: string | null
  /**
   * The product name when the image stands alone (e.g. a preview). "" when the name is shown right
   * next to it (table rows): screen readers then skip the image instead of reading the name twice.
   */
  alt: string
  /** Size and shape, e.g. "size-10" (default) or "size-40 rounded-xl". */
  className?: string
}

/** Product picture from imageUrl. Without a URL, or when it fails to load, the lucide Package icon. */
export function ProductImage({ imageUrl, alt, className }: ProductImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const src = imageUrl && imageUrl !== failedUrl ? imageUrl : null
  const boxClasses = cn("size-10 shrink-0 overflow-hidden rounded-md bg-muted", className)

  if (!src) {
    return (
      <div
        {...(alt === "" ? { "aria-hidden": true } : { role: "img", "aria-label": alt })}
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
      onError={() => setFailedUrl(src)}
    />
  )
}
