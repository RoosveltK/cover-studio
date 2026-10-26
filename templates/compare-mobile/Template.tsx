import { contrast, hexAlpha, readableOn, tone } from "@/lib/color"
import { PHONE_SIZE, PhoneFrame } from "@/mockups/PhoneFrame"
import { COVER_SIZE } from "@/templates/shared/mockups"
import { CoverRoot, Footer, TextBlock } from "@/templates/shared/text-block"
import type { PlacedConfig } from "@/types/cover"

const COLUMN = { left: 130, top: 0, bottom: 0, width: 820 }
/** Ancien écran incliné et plus petit, nouvel écran droit et plus grand. */
const BEFORE = { center: 1330, top: 330, scale: 1.0, tilt: -8 }
const AFTER = { center: 1920, top: 170, scale: 1.25 }

/**
 * Avant / après mobile : sur un aplat de marque, l'ancien écran grisé et
 * incliné, une flèche courbe, puis le nouvel écran mis en avant.
 */
export function CompareMobileTemplate({ config }: { config: PlacedConfig }) {
  const { content, style, mockups } = config
  const brand = style.brandColor
  const light = tone(brand, 0.62, 1)
  const deep = tone(brand, 0.36, 1)
  // Texte blanc tant qu'il reste lisible sur l'aplat, sinon encre sombre.
  const ink = contrast(deep, "#ffffff") >= 4.5 ? "#ffffff" : tone(brand, 0.15, 0.6)
  const onDark = ink === "#ffffff"
  const accent = style.accentColor ?? (onDark ? tone(brand, 0.88, 0.9) : readableOn(brand, light))
  const muted = onDark ? "rgba(255, 255, 255, 0.85)" : tone(brand, 0.3, 0.6)

  const after = mockups.mobileImage2 ?? mockups.mobileImage
  const beforeWidth = PHONE_SIZE.width * BEFORE.scale
  const afterWidth = PHONE_SIZE.width * AFTER.scale

  return (
    <CoverRoot
      size={COVER_SIZE}
      style={{
        backgroundColor: deep,
        backgroundImage: [
          `radial-gradient(circle at 80% 45%, ${hexAlpha(light, 0.9)} 0%, transparent 45%)`,
          `linear-gradient(135deg, ${deep} 0%, ${tone(brand, 0.48, 1)} 100%)`,
        ].join(", "),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: COLUMN.left,
          top: COLUMN.top,
          bottom: COLUMN.bottom,
          width: COLUMN.width,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextBlock
          content={content}
          width={COLUMN.width}
          nameSize={120}
          descriptionLines={4}
          chipRadius={999}
          colors={{
            text: ink,
            muted,
            accent,
            badgeBorder: hexAlpha(ink, 0.4),
            badgeBg: hexAlpha(ink, 0.12),
            chipBg: hexAlpha(ink, 0.14),
            chipText: ink,
          }}
        />
      </div>

      <Footer text={content.footer} color={muted} style={{ left: COLUMN.left, bottom: 90, width: COLUMN.width }} />

      {mockups.showMobile && (
        <>
          <PhoneFrame
            image={mockups.mobileImage}
            scale={BEFORE.scale}
            style={{
              position: "absolute",
              left: BEFORE.center - beforeWidth / 2,
              top: BEFORE.top,
              transform: `rotate(${BEFORE.tilt}deg)`,
              filter: "grayscale(0.9)",
              opacity: 0.75,
            }}
          />

          {/* Flèche courbe de l'ancien écran vers le nouveau. */}
          <svg
            width={360}
            height={220}
            viewBox="0 0 360 220"
            style={{ position: "absolute", left: 1450, top: 120, overflow: "visible" }}
          >
            <path
              d="M 10 200 C 60 40, 220 10, 330 70"
              fill="none"
              stroke={ink}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray="2 22"
            />
            <path
              d="M 290 40 L 335 72 L 285 98"
              fill="none"
              stroke={ink}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <PhoneFrame
            image={after}
            scale={AFTER.scale}
            style={{
              position: "absolute",
              left: AFTER.center - afterWidth / 2,
              top: AFTER.top,
              boxShadow: `0 0 0 10px ${hexAlpha("#ffffff", 0.25)}, 0 60px 140px ${hexAlpha(tone(brand, 0.2, 0.8), 0.6)}`,
            }}
          />
        </>
      )}
    </CoverRoot>
  )
}
