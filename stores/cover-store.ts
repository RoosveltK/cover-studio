import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { defaultLocale, type Locale } from "@/i18n/routing"
import { joinName, rebaseRange } from "@/lib/name"
import { setPath } from "@/lib/path"
import { isPortrait } from "@/lib/slots"
import { DEFAULT_CONFIG, DEFAULT_TEMPLATE, localizeContent } from "@/templates/showcase/defaults"
import type {
  CoverConfig,
  ImageAsset,
  PanelId,
  TemplateTag,
  TextSelection,
} from "@/types/cover"

/** Choix faits sur l'accueil ; ce qui manque est déduit des captures. */
export type StartOptions = {
  template?: string
  icon?: ImageAsset
  brandColor?: string
  /** Export format recommandé par la page de départ (cf. lib/export-sizes). */
  exportSize?: string
}

/**
 * Templates retirés de la galerie et leur plus proche voisin : une config
 * sauvegardée qui pointe vers l'un d'eux rouvre sur un modèle équivalent.
 */
const RETIRED_TEMPLATES: Record<string, string> = {
  perspective: "showcase",
  terminal: "spotlight",
  split: "editorial",
  cascade: "mobile-trio",
  ribbon: "mobile-trio",
  fan: "focus",
  exploded: "callouts",
}

type CoverState = {
  config: CoverConfig
  /** Langue de la page, jamais persistée : elle vient de l'URL. */
  locale: Locale
  /**
   * Panneau ouvert de l'éditeur. Dans le store plutôt qu'en état local : changer de
   * langue recrée la page, et l'utilisateur doit retrouver son panneau.
   */
  activePanel: PanelId
  setActivePanel: (panel: PanelId) => void
  /** Mobile : tiroir du panneau ouvert. Fermé à l'arrivée, jamais persisté. */
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  /** Étiquettes cochées dans le panneau des modèles : survivent au changement de langue, jamais persistées. */
  templateTags: TemplateTag[]
  setTemplateTags: (tags: TemplateTag[]) => void
  /** Texte sélectionné sur l'aperçu (édition directe), jamais persisté. */
  selection: TextSelection | null
  /** Vrai quand le texte sélectionné est en cours de saisie. */
  editing: boolean
  setSelection: (selection: TextSelection | null) => void
  setEditing: (editing: boolean) => void
  /**
   * Vrai pendant un export : l'éditeur monte une copie de la cover sans
   * édition directe (ni emplacements vides, ni bouton d'ajout), seule capturée.
   */
  exportRender: boolean
  setExportRender: (exportRender: boolean) => void
  setField: (path: string, value: unknown) => void
  startFrom: (images: ImageAsset[], options?: StartOptions) => void
  /** Passe les textes d'exemple dans la langue de la page, sans toucher à ceux modifiés. */
  applyLocale: (locale: Locale) => void
}

export const useCoverStore = create<CoverState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      locale: defaultLocale,
      activePanel: "templates",
      setActivePanel: (activePanel) => set({ activePanel }),
      sheetOpen: false,
      setSheetOpen: (sheetOpen) => set({ sheetOpen }),
      templateTags: [],
      setTemplateTags: (templateTags) => set({ templateTags }),
      selection: null,
      editing: false,
      setSelection: (selection) => set({ selection, editing: false }),
      setEditing: (editing) => set({ editing }),
      exportRender: false,
      setExportRender: (exportRender) => set({ exportRender }),
      setField: (path, value) =>
        set((state) => ({
          config:
            // L'accent est une plage du nom : il suit le texte modifié.
            path === "content.name"
              ? setPath(
                  setPath(state.config, path, value),
                  "content.accent",
                  rebaseRange(state.config.content.name, value as string, state.config.content.accent)
                )
              : setPath(state.config, path, value),
          // Un autre template n'a pas forcément le texte sélectionné.
          ...(path === "template" ? { selection: null, editing: false } : {}),
        })),
      applyLocale: (locale) =>
        set((state) => {
          const content = localizeContent(state.config.content, locale)
          return {
            locale,
            config: JSON.stringify(content) === JSON.stringify(state.config.content)
              ? state.config
              : { ...state.config, content },
          }
        }),
      // Point de départ de l'éditeur : les captures, l'icône, la couleur et le
      // modèle choisis sur l'accueil. Sans couleur choisie, la couleur dominante
      // de la première capture devient la couleur de marque.
      startFrom: (images, options = {}) =>
        set((state) => {
          const brandColor = options.brandColor ?? images[0]?.dominant
          // Des captures toutes en portrait appellent le template dédié au mobile.
          const template = options.template
            ? options.template
            : images.every(isPortrait)
            ? "mobile-trio"
            : state.config.template === "mobile-trio"
              ? DEFAULT_TEMPLATE
              : state.config.template
          return {
            config: {
              ...state.config,
              template,
              content: options.icon
                ? { ...state.config.content, icon: options.icon }
                : state.config.content,
              style: brandColor ? { ...state.config.style, brandColor } : state.config.style,
              mockups: { ...state.config.mockups, images },
              export: options.exportSize
                ? { ...state.config.export, size: options.exportSize }
                : state.config.export,
            },
          }
        }),
    }),
    {
      name: "cover-generator",
      // v2 : on abandonne les textes sauvegardés à partir des anciens exemples.
      // v3 : nom d'un seul tenant, l'ancienne suite devient la plage d'accent.
      version: 3,
      migrate: (persisted, version) => {
        if (version !== 2) return {}
        const saved = persisted as { config?: { content?: Record<string, unknown> } }
        const content = saved.config?.content
        if (!content) return saved
        const { nameMain, nameAccent, ...rest } = content
        return {
          ...saved,
          config: {
            ...saved.config,
            content: {
              ...rest,
              ...joinName(String(nameMain ?? ""), String(nameAccent ?? "")),
            },
          },
        }
      },
      storage: createJSONStorage(() => localStorage),
      // Réhydraté côté client par l'éditeur, pour éviter un écart SSR/client.
      skipHydration: true,
      // Les images ne sont pas persistées en V1 (poids).
      partialize: ({ config }) => ({
        config: {
          ...config,
          content: { ...config.content, icon: undefined },
          mockups: { ...config.mockups, images: [] },
        },
      }),
      merge: (persisted, current) => {
        const saved = (persisted as Partial<CoverState> | undefined)?.config
        if (!saved) return current
        return {
          ...current,
          config: {
            ...current.config,
            ...saved,
            template: RETIRED_TEMPLATES[saved.template] ?? saved.template ?? current.config.template,
            content: {
              ...current.config.content,
              ...saved.content,
              icon: current.config.content.icon,
            },
            style: { ...current.config.style, ...saved.style },
            // Les captures en mémoire priment : elles ne sont jamais sauvegardées.
            mockups: {
              ...current.config.mockups,
              browserTheme: saved.mockups?.browserTheme ?? current.config.mockups.browserTheme,
            },
          },
        }
      },
    }
  )
)

let hydrated = false

/** Recharge textes et couleurs sauvegardés, une seule fois par session. */
export function hydrateCoverStore() {
  if (hydrated) return
  hydrated = true
  useCoverStore.persist.rehydrate()
  // Les textes sauvegardés peuvent être ceux d'exemple d'une autre langue.
  const { applyLocale, locale } = useCoverStore.getState()
  applyLocale(locale)
}
