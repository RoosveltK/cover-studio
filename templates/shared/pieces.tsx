import type { CSSProperties } from "react"

import type { CoverConfig } from "@/types/cover"

import { EditableText, useIsEditing, useShowSlot } from "./editable"
import { AppIcon, nameFontSize, useFitScale } from "./text-block"
import { useBadgeShape, useTextScale } from "./typography"

/**
 * Briques de texte isolées, pour les templates qui répartissent pastille, nom
 * et description à des endroits différents (le `TextBlock` les empile).
 */

/** Pastille : taille utilisateur, forme choisie, masquée si vide hors éditeur. */
export function Badge({ text, style }: { text: string; style: CSSProperties }) {
  const scale = useTextScale("badge")
  const shape = useBadgeShape()
  const show = useShowSlot()
  if (!show(text)) return null
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 58 * scale,
        padding: `0 ${26 * scale}px`,
        borderRadius: 999,
        fontSize: 22 * scale,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        maxWidth: "100%",
        ...style,
        ...shape,
      }}
    >
      <EditableText field="badge" text={text} />
    </div>
  )
}

/** Nom de l'app (avec l'icône si elle existe), réduit au-delà de 12 caractères. */
export function AppName({
  content,
  size,
  color,
  accent,
  icon = true,
  style,
}: {
  content: CoverConfig["content"]
  size: number
  color: string
  accent: string
  icon?: boolean
  style?: CSSProperties
}) {
  const baseSize = nameFontSize(content, size) * useTextScale("name")
  const [fitRef, fitScale] = useFitScale(content.name, baseSize)
  const fontSize = baseSize * fitScale
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: Math.round(fontSize * 0.3),
        maxWidth: "100%",
        color,
        ...style,
      }}
    >
      {icon && content.icon && (
        <AppIcon image={content.icon} size={Math.round(fontSize * 1.05)} />
      )}
      <p
        ref={fitRef}
        style={{
          margin: 0,
          minWidth: 0,
          fontSize,
          fontWeight: 700,
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          fontFamily: style?.fontFamily,
        }}
      >
        <EditableText
          field="name"
          text={content.name}
          accent={content.accent}
          accentStyle={{ color: accent }}
        />
      </p>
    </div>
  )
}

/** Description rognée à `lines` lignes (rognage levé pendant la saisie). */
export function Description({
  text,
  size = 31,
  lines = 3,
  style,
}: {
  text: string
  size?: number
  lines?: number
  style?: CSSProperties
}) {
  const scale = useTextScale("description")
  const editing = useIsEditing("description")
  const show = useShowSlot()
  if (!show(text)) return null
  return (
    <p
      style={{
        margin: 0,
        fontSize: size * scale,
        lineHeight: 1.4,
        display: editing ? "block" : "-webkit-box",
        WebkitLineClamp: editing ? undefined : lines,
        WebkitBoxOrient: "vertical",
        overflow: editing ? "visible" : "hidden",
        ...style,
      }}
    >
      <EditableText field="description" text={text} />
    </p>
  )
}
