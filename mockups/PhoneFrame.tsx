import type { CSSProperties } from "react"

import { useTranslations } from "@/i18n/provider"
import { Placeholder } from "@/mockups/BrowserFrame"
import { CoverImage } from "@/mockups/CoverImage"
import type { ImageAsset } from "@/types/cover"

export const PHONE_SIZE = { width: 402, height: 920 }

const RADIUS = 72
const RING = 5
const BEZEL = 13
const STATUS_AREA = 64
/** Zone de la capture dans le cadre (à l'échelle 1) : sert aux templates qui en extraient des morceaux. */
export const PHONE_SCREEN = {
  left: RING + BEZEL,
  top: RING + BEZEL + STATUS_AREA,
  width: PHONE_SIZE.width - 2 * (RING + BEZEL),
  height: PHONE_SIZE.height - 2 * (RING + BEZEL) - STATUS_AREA,
}

type PhoneFrameProps = {
  image?: ImageAsset
  /** Facteur appliqué à toutes les cotes (402 × 920 à l'échelle 1). */
  scale?: number
  /** Ancrage vertical de la capture, pour varier le cadrage d'une même image. */
  imagePosition?: string
  style?: CSSProperties
}

export function PhoneFrame({ image, scale = 1, imagePosition = "top", style }: PhoneFrameProps) {
  const t = useTranslations("mockups")
  const statusColor = image?.topColor ?? "#ffffff"
  const s = (value: number) => value * scale

  return (
    <div
      style={{
        width: s(PHONE_SIZE.width),
        height: s(PHONE_SIZE.height),
        borderRadius: s(RADIUS),
        padding: s(RING),
        background: "linear-gradient(145deg, #3a3a3e, #1a1a1c 45%, #2c2c30)",
        boxShadow: "0 50px 100px rgba(0, 0, 0, 0.5), 0 14px 30px rgba(0, 0, 0, 0.3)",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: s(RADIUS - RING),
          padding: s(BEZEL),
          background: "#050505",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: s(RADIUS - RING - BEZEL),
            overflow: "hidden",
            background: image ? statusColor : "#f4f4f6",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: s(STATUS_AREA),
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {image ? (
              // La capture remplit tout l'écran ; une capture plus courte que l'écran
              // est rognée sur les côtés, recentrable depuis la galerie.
              <CoverImage image={image} position={`50% ${imagePosition}`} />
            ) : (
              <Placeholder color="#a0a0a8" label={t("mobilePlaceholder")} iconSize={s(48)} />
            )}
          </div>
          <div
            style={{
              position: "absolute",
              top: s(14),
              left: "50%",
              width: s(134),
              height: s(38),
              marginLeft: s(-67),
              borderRadius: s(19),
              background: "#050505",
            }}
          />
        </div>
      </div>
    </div>
  )
}
