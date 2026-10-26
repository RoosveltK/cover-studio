import { Star } from "lucide-react"

import { contrast, hexAlpha, readableOn, tone } from "@/lib/color"
import { PHONE_SIZE, PhoneFrame } from "@/mockups/PhoneFrame"
import { COVER_SIZE } from "@/templates/shared/mockups"
import { AppName, Badge, Description } from "@/templates/shared/pieces"
import { Chips, CoverRoot, Footer } from "@/templates/shared/text-block"
import type { PlacedConfig } from "@/types/cover"

// Colonne centrée verticalement entre le haut du cadre et le pied de page.
const COLUMN = { left: 140, top: 60, bottom: 180, width: 1220 }
const CARD = { left: 1500, top: 110, width: 780, height: 1280 }
const PHONE_SCALE = 1.22
const STARS = 5

/**
 * Témoignage : la description devient une citation en grand, signée par le nom
 * de l'app et une note en étoiles ; le téléphone est posé sur une carte de marque.
 */
export function QuoteTemplate({ config }: { config: PlacedConfig }) {
  const { content, style, mockups } = config
  const brand = style.brandColor
  const background = tone(brand, 0.965, 0.18)
  const ink = tone(brand, 0.2, 0.5)
  const muted = tone(brand, 0.42, 0.35)
  const accent = style.accentColor ?? readableOn(brand, background)
  const onBrand =
    contrast(brand, "#ffffff") >= contrast(brand, ink) ? "#ffffff" : ink
  const star = "#f5b301"
  const phoneWidth = PHONE_SIZE.width * PHONE_SCALE
  const phoneHeight = PHONE_SIZE.height * PHONE_SCALE

  return (
    <CoverRoot size={COVER_SIZE} style={{ backgroundColor: background }}>
      <div
        style={{
          position: "absolute",
          left: CARD.left,
          top: CARD.top,
          width: CARD.width,
          height: CARD.height,
          borderRadius: 64,
          background: `linear-gradient(160deg, ${tone(brand, 0.62, 1)} 0%, ${brand} 100%)`,
          transform: "rotate(3deg)",
        }}
      />

      {mockups.showMobile && (
        <PhoneFrame
          image={mockups.mobileImage}
          scale={PHONE_SCALE}
          style={{
            position: "absolute",
            left: CARD.left + (CARD.width - phoneWidth) / 2,
            top: CARD.top + (CARD.height - phoneHeight) / 2,
            transform: "rotate(-3deg)",
            boxShadow: `0 50px 110px ${hexAlpha(tone(brand, 0.25, 0.8), 0.4)}`,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          left: COLUMN.left,
          top: COLUMN.top,
          bottom: COLUMN.bottom,
          justifyContent: "center",
          width: COLUMN.width,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          color: ink,
        }}
      >
        <Badge
          text={content.badge}
          style={{ background: brand, color: onBrand }}
        />

        {/* Guillemet décoratif, dessiné en CSS pour ne dépendre d'aucune police. */}
        <div
          aria-hidden
          style={{
            marginTop: 50,
            fontSize: 300,
            lineHeight: 0.6,
            height: 150,
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            color: hexAlpha(brand, 0.85),
          }}
        >
          &ldquo;
        </div>

        <Description
          text={content.description}
          size={76}
          lines={5}
          style={{
            marginTop: 10,
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        />

        <div
          style={{
            marginTop: 60,
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          <AppName content={content} size={64} color={ink} accent={accent} />
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: STARS }, (_, index) => (
              <Star
                key={index}
                size={40}
                fill={star}
                color={star}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>

        <Chips
          chips={content.chips}
          colors={{
            text: ink,
            chipBg: "#ffffff",
            chipText: muted,
            chipBorder: tone(brand, 0.88, 0.4),
          }}
          radius={999}
          maxWidth={COLUMN.width}
          style={{ marginTop: 44 }}
        />
      </div>

      <Footer
        text={content.footer}
        color={muted}
        style={{ left: COLUMN.left, bottom: 90, width: COLUMN.width }}
      />
    </CoverRoot>
  )
}
