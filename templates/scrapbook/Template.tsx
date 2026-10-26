import type { CSSProperties, ReactNode } from "react"

import { contrast, hexAlpha, readableOn, tone } from "@/lib/color"
import { fontStack } from "@/lib/fonts"
import { Placeholder } from "@/mockups/BrowserFrame"
import { CoverImage } from "@/mockups/CoverImage"
import { useTranslations } from "@/i18n/provider"
import {
  EditableText,
  useEditorChips,
  useShowSlot,
} from "@/templates/shared/editable"
import { COVER_SIZE } from "@/templates/shared/mockups"
import { AppName, Description } from "@/templates/shared/pieces"
import { CoverRoot, Footer } from "@/templates/shared/text-block"
import { useBadgeShape, useTextScale } from "@/templates/shared/typography"
import type { ImageAsset, PlacedConfig } from "@/types/cover"

const HAND = fontStack("caveat")
const CAPTION_HEIGHT = 100

type Photo = {
  left: number
  top: number
  width: number
  height: number
  rotate: number
  tape: { left: number; width: number; rotate: number }
}

/** Tirage de la capture desktop, du premier écran mobile, puis d'un second cadrage mobile. */
const PHOTOS: Photo[] = [
  {
    left: 820,
    top: 160,
    width: 940,
    height: 588,
    rotate: -3,
    tape: { left: 380, width: 220, rotate: -4 },
  },
  {
    left: 1840,
    top: 420,
    width: 360,
    height: 600,
    rotate: 5,
    tape: { left: 100, width: 170, rotate: 8 },
  },
  {
    left: 1080,
    top: 900,
    width: 400,
    height: 400,
    rotate: -7,
    tape: { left: 110, width: 180, rotate: -12 },
  },
]

function Polaroid({
  photo,
  tape,
  children,
  caption,
}: {
  photo: Photo
  tape: string
  children: ReactNode
  caption: ReactNode
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: photo.left,
        top: photo.top,
        padding: "26px 26px 0",
        background: "#ffffff",
        transform: `rotate(${photo.rotate}deg)`,
        boxShadow: "0 20px 40px rgba(60, 40, 20, 0.22)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: photo.width,
          height: photo.height,
          overflow: "hidden",
          background: "#f4f4f6",
        }}
      >
        {children}
      </div>
      <div
        style={{
          height: CAPTION_HEIGHT,
          maxWidth: photo.width,
          display: "flex",
          alignItems: "center",
          fontFamily: HAND,
          fontSize: 52,
          fontWeight: 500,
          color: "#2b2b2b",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {caption}
      </div>
      {/* Ruban adhésif à cheval sur le haut du tirage. */}
      <div
        style={{
          position: "absolute",
          left: photo.tape.left,
          top: -28,
          width: photo.tape.width,
          height: 56,
          background: tape,
          transform: `rotate(${photo.tape.rotate}deg)`,
        }}
      />
    </div>
  )
}

/**
 * Carnet : les captures tirées en polaroïds et scotchées sur une page pointillée,
 * légendées à la main par les fonctionnalités ; la pastille devient un sticker.
 */
export function ScrapbookTemplate({ config }: { config: PlacedConfig }) {
  const { content, style, mockups } = config
  const t = useTranslations("mockups")
  const brand = style.brandColor
  const paper = tone(brand, 0.95, 0.12)
  const ink = tone(brand, 0.2, 0.5)
  const accent = style.accentColor ?? readableOn(brand, paper)
  const tape = hexAlpha(tone(brand, 0.75, 0.9), 0.6)
  const sticker = readableOn(brand, "#ffffff", 3)
  const onSticker = contrast(sticker, "#ffffff") >= 3 ? "#ffffff" : ink
  const show = useShowSlot()
  const chips = useEditorChips(content.chips)
  const badgeScale = useTextScale("badge")
  const badgeShape = useBadgeShape()

  // Sans capture desktop, le grand tirage montre l'écran mobile, et inversement.
  const desktop = mockups.showDesktop
    ? mockups.desktopImage
    : mockups.mobileImage
  const mobile = mockups.showMobile ? mockups.mobileImage : mockups.desktopImage
  const shots: { image?: ImageAsset; position: string; mobile: boolean }[] = [
    {
      image: desktop,
      position: `50% ${(mockups.desktopCropY ?? 0) * 100}%`,
      mobile: !mockups.showDesktop,
    },
    { image: mobile, position: "50% 0%", mobile: true },
    { image: mobile, position: "50% 70%", mobile: true },
  ]

  const caption = (index: number) =>
    show(content.chips) && chips[index] !== undefined ? (
      <EditableText field="chips" text={chips[index]} index={index} />
    ) : null

  const handStyle: CSSProperties = { fontFamily: HAND }

  return (
    <CoverRoot
      size={COVER_SIZE}
      style={{
        backgroundColor: paper,
        backgroundImage: `radial-gradient(${hexAlpha(tone(brand, 0.45, 0.6), 0.25)} 2px, transparent 2.2px)`,
        backgroundSize: "40px 40px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 170,
          width: 680,
          transform: "rotate(-3deg)",
        }}
      >
        <AppName
          content={content}
          size={200}
          color={ink}
          accent={accent}
          style={handStyle}
        />
        <Description
          text={content.description}
          size={58}
          lines={4}
          style={{
            ...handStyle,
            marginTop: 24,
            lineHeight: 1.1,
            color: tone(brand, 0.35, 0.9),
          }}
        />
      </div>

      <svg
        width="320"
        height="220"
        viewBox="0 0 320 220"
        aria-hidden
        style={{ position: "absolute", left: 560, top: 680 }}
      >
        <path
          d="M10 190 C 80 200, 180 160, 270 50"
          fill="none"
          stroke={accent}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M220 50 L 272 46 L 268 100"
          fill="none"
          stroke={accent}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {PHOTOS.map((photo, index) => {
        const shot = shots[index]
        return (
          <Polaroid
            key={photo.left}
            photo={photo}
            tape={tape}
            caption={caption(index)}
          >
            {shot.image ? (
              <CoverImage image={shot.image} position={shot.position} />
            ) : (
              <Placeholder
                color="#a0a0a8"
                label={t(
                  shot.mobile ? "mobilePlaceholder" : "desktopPlaceholder"
                )}
                iconSize={56}
              />
            )}
          </Polaroid>
        )
      })}

      {show(content.badge) && (
        <div
          style={{
            position: "absolute",
            left: 220,
            top: 1060,
            width: 260,
            height: 260,
            padding: 30,
            borderRadius: "50%",
            background: sticker,
            color: onSticker,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            transform: "rotate(-12deg)",
            boxShadow: `0 10px 0 ${tone(brand, 0.3, 0.8)}`,
            fontFamily: HAND,
            fontSize: 48 * badgeScale,
            fontWeight: 700,
            lineHeight: 1,
            overflowWrap: "anywhere",
            overflow: "hidden",
            ...badgeShape,
          }}
        >
          <EditableText field="badge" text={content.badge} />
        </div>
      )}

      <Footer
        text={content.footer}
        color={tone(brand, 0.35, 0.6)}
        style={{
          right: 120,
          bottom: 60,
          maxWidth: 600,
          textAlign: "right",
          fontFamily: HAND,
          fontSize: 40,
        }}
      />
    </CoverRoot>
  )
}
