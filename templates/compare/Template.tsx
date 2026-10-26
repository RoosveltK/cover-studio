import { ArrowRight } from "lucide-react"

import { contrast, hexAlpha, readableOn, tone } from "@/lib/color"
import { BrowserFrame } from "@/mockups/BrowserFrame"
import {
  COVER_SIZE,
  browserContentHeight,
  gridLayers,
  resolveBrowserTheme,
} from "@/templates/shared/mockups"
import { CoverRoot, Footer, TextBlock } from "@/templates/shared/text-block"
import { useEditorChips } from "@/templates/shared/editable"
import type { PlacedConfig } from "@/types/cover"

const TEXT = { top: 100, width: 1700 }
const BROWSER = { width: 1000, gap: 160 }
const BROWSER_CONTENT = { min: 520, max: 640, empty: 600 }
const ARROW = 120
const GRID_CELL = 64

/**
 * Avant / après : deux pages côte à côte sous un titre centré, l'ancienne
 * désaturée, la nouvelle en couleur, reliées par une flèche. Pour une refonte,
 * un mode sombre ou une nouvelle version d'écran.
 */
export function CompareTemplate({ config }: { config: PlacedConfig }) {
  const { content, style, mockups } = config
  // Dans l'éditeur, une liste vide montre une chip à remplir.
  const chips = useEditorChips(content.chips)
  const brand = style.brandColor
  const background = tone(brand, 0.97, 0.2)
  const ink = tone(brand, 0.22, 0.5)
  const accent = style.accentColor ?? readableOn(brand, background)
  const onBrand =
    contrast(brand, "#ffffff") >= contrast(brand, ink) ? "#ffffff" : ink

  const mockupTop = chips.length > 0 ? 700 : 610
  const left = (COVER_SIZE.width - 2 * BROWSER.width - BROWSER.gap) / 2
  // Sans deuxième capture, la page « après » reprend la première.
  const after = mockups.desktopImage2 ?? mockups.desktopImage
  const theme = resolveBrowserTheme(mockups)
  const height = (image: typeof after) =>
    browserContentHeight(image, BROWSER.width, BROWSER_CONTENT)
  const contentHeight = Math.max(height(mockups.desktopImage), height(after))

  return (
    <CoverRoot
      size={COVER_SIZE}
      style={{
        backgroundColor: background,
        backgroundImage: [
          ...gridLayers(hexAlpha(ink, 0.045)),
          `radial-gradient(ellipse 45% 55% at 75% 100%, ${hexAlpha(brand, 0.3)} 0%, transparent 100%)`,
        ].join(", "),
        backgroundSize: `${GRID_CELL}px ${GRID_CELL}px, ${GRID_CELL}px ${GRID_CELL}px, 100% 100%`,
      }}
    >
      <Footer
        text={content.footer}
        color={tone(brand, 0.35, 0.4)}
        style={{ left: 90, top: 64, maxWidth: 600, fontSize: 24 }}
      />

      <TextBlock
        content={content}
        align="center"
        width={TEXT.width}
        nameSize={96}
        descriptionLines={2}
        chipRadius={999}
        colors={{
          text: ink,
          muted: tone(brand, 0.42, 0.35),
          accent,
          badgeBorder: tone(brand, 0.8, 0.6),
          badgeBg: "rgba(255, 255, 255, 0.7)",
          badgeText: readableOn(brand, "#ffffff"),
          chipBg: "#ffffff",
          chipText: ink,
          chipBorder: tone(brand, 0.88, 0.4),
        }}
        style={{
          position: "absolute",
          left: (COVER_SIZE.width - TEXT.width) / 2,
          top: TEXT.top,
        }}
      />

      {mockups.showDesktop && (
        <>
          <BrowserFrame
            image={mockups.desktopImage}
            url={content.browserUrl}
            favicon={content.icon}
            theme={theme}
            width={BROWSER.width}
            contentHeight={contentHeight}
            cropY={mockups.desktopCropY}
            style={{
              position: "absolute",
              left,
              top: mockupTop,
              filter: "grayscale(0.85)",
              opacity: 0.8,
              boxShadow: "0 30px 70px rgba(0, 0, 0, 0.12)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: left + BROWSER.width + (BROWSER.gap - ARROW) / 2,
              top: mockupTop + contentHeight / 2 - ARROW / 2 + 20,
              width: ARROW,
              height: ARROW,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: brand,
              color: onBrand,
              boxShadow: `0 20px 50px ${hexAlpha(tone(brand, 0.35, 0.8), 0.35)}`,
            }}
          >
            <ArrowRight size={60} strokeWidth={2.5} />
          </div>

          <BrowserFrame
            image={after}
            url={content.browserUrl}
            favicon={content.icon}
            theme={theme}
            width={BROWSER.width}
            contentHeight={contentHeight}
            cropY={mockups.desktopImage2 ? undefined : mockups.desktopCropY}
            style={{
              position: "absolute",
              left: left + BROWSER.width + BROWSER.gap,
              top: mockupTop,
              boxShadow: `0 0 0 6px ${hexAlpha(brand, 0.35)}, 0 40px 100px ${hexAlpha(tone(brand, 0.3, 0.8), 0.3)}`,
            }}
          />
        </>
      )}
    </CoverRoot>
  )
}
