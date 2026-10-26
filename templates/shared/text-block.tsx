import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react"

import { DEFAULT_FONT, fontStack } from "@/lib/fonts"
import type { CoverConfig, ImageAsset } from "@/types/cover"

import {
  EditableText,
  useAddChip,
  useEditorChips,
  useIsEditing,
  useShowSlot,
} from "./editable"
import { TypographyContext, useBadgeShape, useTextScale } from "./typography"

export { TypographyContext, useTextScale }

export type TextColors = {
  text: string
  muted: string
  accent: string
  badgeBorder: string
  badgeBg: string
  badgeText?: string
  chipBg: string
  chipText?: string
  chipBorder?: string
}

type TextBlockProps = {
  content: CoverConfig["content"]
  colors: TextColors
  width: number
  align?: "left" | "center"
  /** Taille du nom pour un nom court ; réduite au-delà de 12 caractères. */
  nameSize?: number
  descriptionLines?: number
  /** Coins des chips : 12 par défaut, 999 pour des pilules, 0 pour du carré. */
  chipRadius?: number
  /** Masque les chips quand le template les affiche ailleurs. */
  hideChips?: boolean
  style?: CSSProperties
}

/** Taille du nom : `base` jusqu'à 12 caractères, réduite au-delà (hors échelle utilisateur). */
export function nameFontSize(
  content: Pick<CoverConfig["content"], "name">,
  base: number
) {
  const length = content.name.length
  return length <= 12 ? base : Math.max(base * 0.66, (base * 12) / length)
}

/**
 * Échelle du nom pour que son mot le plus long tienne dans sa largeur : le nom
 * ne passe à la ligne qu'entre deux mots, jamais au milieu d'un mot (« MonAp / p »).
 * Mesuré dans le DOM après rendu, puis de nouveau une fois les polices chargées.
 */
export function useFitScale(text: string, fontSize: number) {
  // Ref de rappel gardée en état : la mesure se relance quand l'élément change.
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (!element) return
    // Copie invisible à la taille de base, à la largeur laissée par la ligne
    // (icône comprise) : un mot trop long la fait déborder, le rapport des
    // largeurs donne l'échelle. Les cotes de mise en page ignorent le zoom de l'aperçu.
    const measure = () => {
      const parent = element.parentElement
      if (!parent) return
      const others = Array.from(parent.children).filter((child) => child !== element)
      const gap = parseFloat(getComputedStyle(parent).columnGap) || 0
      const width =
        parent.clientWidth -
        others.reduce((sum, child) => sum + (child as HTMLElement).offsetWidth + gap, 0)
      const probe = element.cloneNode(true) as HTMLElement
      Object.assign(probe.style, {
        position: "absolute",
        visibility: "hidden",
        width: `${width}px`,
        fontSize: `${fontSize}px`,
      })
      parent.appendChild(probe)
      const natural = probe.scrollWidth
      probe.remove()
      setScale(natural > width ? Math.floor((width / natural) * 1000) / 1000 : 1)
    }
    measure()
    let active = true
    document.fonts?.ready.then(() => active && measure())
    return () => {
      active = false
    }
  }, [element, text, fontSize])

  return [setElement, scale] as const
}

/** Pastille, nom, description et chips : bloc de texte commun aux templates. */
export function TextBlock({
  content,
  colors,
  width,
  align = "left",
  nameSize = 102,
  descriptionLines = 3,
  chipRadius = 12,
  hideChips = false,
  style,
}: TextBlockProps) {
  const baseSize = nameFontSize(content, nameSize) * useTextScale("name")
  const [fitRef, fitScale] = useFitScale(content.name, baseSize)
  const fontSize = baseSize * fitScale
  const badgeScale = useTextScale("badge")
  const descriptionScale = useTextScale("description")
  const editingDescription = useIsEditing("description")
  const show = useShowSlot()
  const badgeShape = useBadgeShape()
  const centered = align === "center"

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: centered ? "center" : "flex-start",
        textAlign: align,
        color: colors.text,
        ...style,
      }}
    >
      {show(content.badge) && (
        <div
          style={{
            height: 61 * badgeScale,
            display: "flex",
            alignItems: "center",
            padding: `0 ${27 * badgeScale}px`,
            borderRadius: 999,
            border: `2px solid ${colors.badgeBorder}`,
            background: colors.badgeBg,
            color: colors.badgeText ?? colors.text,
            fontSize: 22 * badgeScale,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            overflow: "hidden",
            ...badgeShape,
          }}
        >
          <EditableText field="badge" text={content.badge} />
        </div>
      )}

      <div
        style={{
          marginTop: 38,
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: centered ? "center" : "flex-start",
          gap: Math.round(fontSize * 0.3),
        }}
      >
        {content.icon && <AppIcon image={content.icon} size={Math.round(fontSize * 1.1)} />}
        <p
          ref={fitRef}
          style={{
            margin: 0,
            minWidth: 0,
            fontSize,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          <EditableText
            field="name"
            text={content.name}
            accent={content.accent}
            accentStyle={{ color: colors.accent }}
          />
        </p>
      </div>

      {show(content.description) && (
        <p
          style={{
            margin: "22px 0 0",
            fontSize: 31 * descriptionScale,
            lineHeight: 1.45,
            color: colors.muted,
            // Le rognage est levé pendant la saisie pour garder le curseur visible.
            display: editingDescription ? "block" : "-webkit-box",
            WebkitLineClamp: editingDescription ? undefined : descriptionLines,
            WebkitBoxOrient: "vertical",
            overflow: editingDescription ? "visible" : "hidden",
          }}
        >
          <EditableText field="description" text={content.description} />
        </p>
      )}

      {!hideChips && show(content.chips) && (
        <Chips
          chips={content.chips}
          colors={colors}
          radius={chipRadius}
          maxWidth={width}
          justify={centered ? "center" : "flex-start"}
          style={{ marginTop: 50 }}
        />
      )}
    </div>
  )
}

/** Icône d'app aux coins arrondis façon iOS (≈ 22 % du côté). */
export function AppIcon({
  image,
  size,
  style,
}: {
  image: ImageAsset
  size: number
  style?: CSSProperties
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.dataUrl}
      alt=""
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        objectFit: "cover",
        borderRadius: size * 0.225,
        display: "block",
        ...style,
      }}
    />
  )
}

export function Chips({
  chips,
  colors,
  radius = 12,
  maxWidth,
  justify = "flex-start",
  style,
}: {
  chips: string[]
  colors: Pick<TextColors, "text" | "chipBg" | "chipText" | "chipBorder">
  radius?: number
  maxWidth: number
  justify?: "flex-start" | "center"
  style?: CSSProperties
}) {
  const scale = useTextScale("chips")
  const items = useEditorChips(chips)
  const addChip = useAddChip()
  const chipStyle: CSSProperties = {
    height: 58 * scale,
    display: "inline-flex",
    alignItems: "center",
    padding: `0 ${24 * scale}px`,
    borderRadius: radius,
    fontSize: 22 * scale,
    fontWeight: 500,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    maxWidth,
  }
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: justify,
        gap: "16px 15px",
        ...style,
      }}
    >
      {items.map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          style={{
            ...chipStyle,
            background: colors.chipBg,
            color: colors.chipText ?? colors.text,
            border: colors.chipBorder ? `2px solid ${colors.chipBorder}` : undefined,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <EditableText field="chips" text={chip} index={index} />
        </span>
      ))}
      {/* Éditeur seulement : ajoute une chip à la suite, comme un champ de tags. */}
      {addChip && chips.length > 0 && (
        <button
          type="button"
          aria-label={addChip.label}
          title={addChip.label}
          onClick={addChip.add}
          style={{
            ...chipStyle,
            justifyContent: "center",
            minWidth: 58 * scale,
            background: "transparent",
            color: colors.chipText ?? colors.text,
            border: `2px dashed ${colors.chipText ?? colors.text}`,
            opacity: 0.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          +
        </button>
      )}
    </div>
  )
}

export function Footer({
  text,
  color,
  style,
}: {
  text: string
  color: string
  style: CSSProperties
}) {
  const scale = useTextScale("footer")
  const show = useShowSlot()
  if (!show(text)) return null
  return (
    <div
      style={{
        position: "absolute",
        fontWeight: 500,
        color,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...style,
        fontSize: (typeof style.fontSize === "number" ? style.fontSize : 26) * scale,
      }}
    >
      <EditableText field="footer" text={text} />
    </div>
  )
}

/**
 * Canevas du format d'export choisi. Absent : le canevas vaut la taille
 * native du template.
 */
export const CanvasContext = createContext<{ width: number; height: number } | null>(null)

/**
 * Racine commune : police du template et rognage. Le fond (`style`) couvre
 * tout le canevas du format, le contenu garde sa taille native au centre.
 */
export function CoverRoot({
  size,
  style,
  children,
}: {
  size: { width: number; height: number }
  style: CSSProperties
  children: React.ReactNode
}) {
  const canvas = useContext(CanvasContext) ?? size
  const typography = useContext(TypographyContext)

  return (
    <div
      style={{
        ...canvas,
        position: "relative",
        overflow: "hidden",
        fontFamily: fontStack(typography?.fontFamily ?? DEFAULT_FONT),
        ...style,
      }}
    >
      <div
        style={{
          ...size,
          position: "absolute",
          left: (canvas.width - size.width) / 2,
          top: (canvas.height - size.height) / 2,
        }}
      >
        {children}
      </div>
    </div>
  )
}
