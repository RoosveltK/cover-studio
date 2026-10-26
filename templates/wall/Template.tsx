import { hexAlpha, readableOn, tone } from "@/lib/color"
import { CoverImage } from "@/mockups/CoverImage"
import { COVER_SIZE } from "@/templates/shared/mockups"
import { CoverRoot, Footer, TextBlock } from "@/templates/shared/text-block"
import type { ImageAsset, PlacedConfig } from "@/types/cover"

const COLUMN = { left: 140, top: 360, width: 860 }
const DESKTOP_TILE = { width: 640, height: 400 }
const PHONE_TILE = { width: 300, height: 650 }
const GAP = 24
/** Décalage vertical de chaque colonne, pour casser l'alignement de la grille. */
const COLUMN_OFFSETS = [0, -280, -120, -400, -60]
const ROWS = 4

type Tile = { kind: "desktop" | "mobile"; image?: ImageAsset }

/**
 * Mur isométrique : les captures répétées en mosaïque inclinée qui déborde du
 * cadre ; le texte se pose sur un fondu de la couleur de fond, à gauche.
 */
export function WallTemplate({ config }: { config: PlacedConfig }) {
  const { content, style, mockups } = config
  const brand = style.brandColor
  const bg = tone(brand, 0.17, 0.6)
  const accent = style.accentColor ?? readableOn(tone(brand, 0.75, 1), bg)
  const placeholder = tone(brand, 0.3, 0.6)

  // Une colonne alterne une capture desktop et une paire d'écrans mobiles ;
  // sans l'un des deux types, toutes les cases prennent l'autre.
  const kinds: Tile["kind"][] = [
    ...(mockups.showDesktop ? (["desktop"] as const) : []),
    ...(mockups.showMobile ? (["mobile"] as const) : []),
  ]
  const tile = (index: number): Tile => {
    const kind = kinds[index % kinds.length] ?? "desktop"
    return {
      kind,
      image: kind === "desktop" ? mockups.desktopImage : mockups.mobileImage,
    }
  }

  const renderTile = ({ kind, image }: Tile, key: string) => {
    const size = kind === "desktop" ? DESKTOP_TILE : PHONE_TILE
    const box = (suffix: string, position: string) => (
      <div
        key={`${key}-${suffix}`}
        style={{
          ...size,
          flex: "none",
          borderRadius: kind === "desktop" ? 18 : 34,
          overflow: "hidden",
          background: placeholder,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.35)",
        }}
      >
        {image && <CoverImage image={image} position={position} />}
      </div>
    )
    if (kind === "desktop")
      return box("d", `50% ${(mockups.desktopCropY ?? 0) * 100}%`)
    return (
      <div key={key} style={{ display: "flex", gap: GAP }}>
        {box("a", "50% 0%")}
        {box("b", "50% 60%")}
      </div>
    )
  }

  return (
    <CoverRoot size={COVER_SIZE} style={{ backgroundColor: bg }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 620,
          top: -820,
          display: "flex",
          gap: GAP,
          transform: "rotateX(52deg) rotateZ(-38deg)",
          transformOrigin: "50% 50%",
        }}
      >
        {COLUMN_OFFSETS.map((offset, column) => (
          <div
            key={offset}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              marginTop: offset,
            }}
          >
            {Array.from({ length: ROWS }, (_, row) =>
              renderTile(tile(row + column), `${column}-${row}`)
            )}
          </div>
        ))}
      </div>

      {/* Fondu vers la couleur de fond, sous la colonne de texte. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${bg} 0%, ${bg} 30%, ${hexAlpha(bg, 0.85)} 42%, ${hexAlpha(bg, 0)} 64%)`,
        }}
      />

      <TextBlock
        content={content}
        width={COLUMN.width}
        nameSize={150}
        chipRadius={999}
        colors={{
          text: "#ffffff",
          muted: "rgba(255, 255, 255, 0.78)",
          accent,
          badgeBorder: hexAlpha(accent, 0.5),
          badgeBg: hexAlpha(accent, 0.12),
          badgeText: accent,
          chipBg: "rgba(255, 255, 255, 0.1)",
          chipBorder: "rgba(255, 255, 255, 0.2)",
        }}
        style={{ position: "absolute", left: COLUMN.left, top: COLUMN.top }}
      />

      <Footer
        text={content.footer}
        color="rgba(255, 255, 255, 0.7)"
        style={{ left: COLUMN.left, bottom: 100, width: COLUMN.width }}
      />
    </CoverRoot>
  )
}
