import type { CSSProperties } from "react"

import type { ImageAsset } from "@/types/cover"

type CoverImageProps = {
  image: ImageAsset
  /**
   * Cadrage par défaut, en valeur CSS de `background-position` (ex. `50% 20%`).
   * Le point de cadrage choisi par l'utilisateur (`image.focus`) passe devant.
   */
  position?: string
  style?: CSSProperties
}

/** Point de cadrage de la capture en `background-position`, sinon `fallback`. */
function focusPosition(image: ImageAsset, fallback: string) {
  const { focus } = image
  return focus ? `${focus.x * 100}% ${focus.y * 100}%` : fallback
}

/**
 * Capture affichée en `cover` : elle remplit toujours son cadre, quitte à être
 * rognée. Un `background-image` plutôt qu'un `<img>` avec `object-fit` :
 * Safari/iOS ignore `object-fit` dans le `foreignObject` SVG utilisé par la
 * capture DOM, ce qui déformait les captures à l'export.
 */
export function CoverImage({ image, position = "50% 0%", style }: CoverImageProps) {
  return (
    <div
      role="presentation"
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url("${image.dataUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: focusPosition(image, position),
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    />
  )
}
