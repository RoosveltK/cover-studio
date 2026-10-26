import { ChevronsLeftRight } from "lucide-react"

import { hexAlpha, readableOn, tone } from "@/lib/color"
import { BROWSER_BAR_HEIGHT, BrowserFrame } from "@/mockups/BrowserFrame"
import { COVER_SIZE, gridLayers, resolveBrowserTheme } from "@/templates/shared/mockups"
import { CoverRoot, Footer, TextBlock } from "@/templates/shared/text-block"
import type { ImageAsset, PlacedConfig } from "@/types/cover"

const COLUMN = { left: 130, top: 0, bottom: 0, width: 700 }
const BROWSER = { left: 920, top: 230, width: 1360, contentHeight: 1040 }
const KNOB = 120
const GRID_CELL = 64

/** Hauteur commune aux deux pages : celle de la plus courte, pour que les cadres se superposent. */
function sharedHeight(images: (ImageAsset | undefined)[]) {
  return Math.min(
    BROWSER.contentHeight,
    ...images.map((image) =>
      image ? Math.round((BROWSER.width * image.height) / image.width) : BROWSER.contentHeight
    )
  )
}

/**
 * Curseur avant / après : une seule page coupée en deux par une poignée,
 * l'ancienne version à gauche, la nouvelle à droite, sur fond sombre.
 */
export function SwipeTemplate({ config }: { config: PlacedConfig }) {
  const { content, style, mockups } = config
  const brand = style.brandColor
  const background = tone(brand, 0.16, 0.6)
  const accent = style.accentColor ?? readableOn(brand, background)
  const glow = tone(brand, 0.55, 1)

  const before = mockups.desktopImage
  // Sans deuxième capture, la moitié « après » reprend la première.
  const after = mockups.desktopImage2 ?? before
  const contentHeight = sharedHeight([before, after])
  const theme = resolveBrowserTheme(mockups)
  const split = BROWSER.width / 2
  const frame = (image: ImageAsset | undefined, clip?: string) => (
    <BrowserFrame
      image={image}
      url={content.browserUrl}
      favicon={content.icon}
      theme={theme}
      width={BROWSER.width}
      contentHeight={contentHeight}
      style={{
        position: "absolute",
        left: BROWSER.left,
        top: BROWSER.top,
        clipPath: clip,
        filter: clip ? "grayscale(0.9)" : undefined,
        boxShadow: clip ? "none" : `0 60px 140px rgba(0, 0, 0, 0.55)`,
      }}
    />
  )

  return (
    <CoverRoot
      size={COVER_SIZE}
      style={{
        backgroundColor: background,
        backgroundImage: [
          ...gridLayers("rgba(255, 255, 255, 0.035)"),
          `radial-gradient(ellipse 45% 55% at 70% 45%, ${hexAlpha(glow, 0.4)} 0%, transparent 100%)`,
        ].join(", "),
        backgroundSize: `${GRID_CELL}px ${GRID_CELL}px, ${GRID_CELL}px ${GRID_CELL}px, 100% 100%`,
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
          nameSize={110}
          descriptionLines={4}
          chipRadius={999}
          colors={{
            text: "#ffffff",
            muted: "rgba(255, 255, 255, 0.8)",
            accent,
            badgeBorder: hexAlpha(accent, 0.6),
            badgeBg: hexAlpha(brand, 0.25),
            chipBg: "rgba(255, 255, 255, 0.1)",
            chipBorder: "rgba(255, 255, 255, 0.16)",
          }}
        />
      </div>

      <Footer
        text={content.footer}
        color="rgba(255, 255, 255, 0.7)"
        style={{ left: COLUMN.left, bottom: 90, width: COLUMN.width }}
      />

      {mockups.showDesktop && (
        <>
          {frame(after)}
          {/* La page « avant » recouvre la moitié gauche du même cadre. */}
          {frame(before, `inset(0 ${BROWSER.width - split}px 0 0)`)}

          <div
            style={{
              position: "absolute",
              left: BROWSER.left + split - 3,
              top: BROWSER.top - 40,
              width: 6,
              height: contentHeight + BROWSER_BAR_HEIGHT + 80,
              borderRadius: 3,
              background: "#ffffff",
              boxShadow: "0 0 24px rgba(0, 0, 0, 0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: BROWSER.left + split - KNOB / 2,
              top: BROWSER.top + BROWSER_BAR_HEIGHT + contentHeight / 2 - KNOB / 2,
              width: KNOB,
              height: KNOB,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              color: tone(brand, 0.3, 0.8),
              boxShadow: `0 0 0 10px ${hexAlpha(brand, 0.35)}, 0 20px 50px rgba(0, 0, 0, 0.4)`,
            }}
          >
            <ChevronsLeftRight size={64} strokeWidth={2.5} />
          </div>
        </>
      )}
    </CoverRoot>
  )
}
