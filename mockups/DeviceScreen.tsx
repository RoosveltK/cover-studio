import type { CSSProperties } from "react"

import { useTranslations } from "@/i18n/provider"
import { Placeholder } from "@/mockups/BrowserFrame"
import { CoverImage } from "@/mockups/CoverImage"
import type { ImageAsset } from "@/types/cover"

/** Rapport largeur / hauteur des écrans d'ordinateur (16:10), celui des captures desktop courantes. */
export const DESKTOP_SCREEN_RATIO = 16 / 10

/**
 * Écran d'un appareil (laptop, moniteur, tablette) : la capture en `cover`,
 * calée selon le recadrage vertical choisi, ou un emplacement vide.
 */
export function DeviceScreen({
  image,
  cropY = 0,
  radius,
  iconSize,
  dark = false,
  style,
}: {
  image?: ImageAsset
  cropY?: number
  radius: number
  iconSize: number
  dark?: boolean
  style?: CSSProperties
}) {
  const t = useTranslations("mockups")
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: radius,
        overflow: "hidden",
        background: dark ? "#1f1f24" : "#f4f4f6",
        ...style,
      }}
    >
      {image ? (
        <CoverImage image={image} position={`50% ${cropY * 100}%`} />
      ) : (
        <Placeholder
          color={dark ? "#6c6c76" : "#a0a0a8"}
          label={t("desktopPlaceholder")}
          iconSize={iconSize}
        />
      )}
    </div>
  )
}
