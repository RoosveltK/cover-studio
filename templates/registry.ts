import type { Slot, Template } from "@/types/cover"

import { AuroraTemplate } from "./aurora/Template"
import { BentoTemplate } from "./bento/Template"
import { BrutalTemplate } from "./brutal/Template"
import { CalloutsTemplate } from "./callouts/Template"
import { EditorialTemplate } from "./editorial/Template"
import { FocusTemplate } from "./focus/Template"
import { MobileTrioTemplate } from "./mobile-trio/Template"
import { PosterTemplate } from "./poster/Template"
import { ShowcaseTemplate } from "./showcase/Template"
import { SpotlightTemplate } from "./spotlight/Template"
import { StoreTemplate } from "./store/Template"
import { SunburstTemplate } from "./sunburst/Template"
import { WallTemplate } from "./wall/Template"
import { BrandboardTemplate } from "./brandboard/Template"
import { StudioTemplate } from "./studio/Template"
import { DevicesTemplate } from "./devices/Template"
import { LongscrollTemplate } from "./longscroll/Template"
import { CloseupTemplate } from "./closeup/Template"
import { FlatlayTemplate } from "./flatlay/Template"
import { MetricsTemplate } from "./metrics/Template"
import { BlueprintTemplate } from "./blueprint/Template"
import { ScrapbookTemplate } from "./scrapbook/Template"
import { DesktopTemplate } from "./desktop/Template"
import { CompareTemplate } from "./compare/Template"
import { QuoteTemplate } from "./quote/Template"
import { baseSchema, metricsSchema, mobileTrioSchema, noBrowserBarSchema } from "./shared/schema"
import { COVER_SIZE } from "./shared/mockups"

const BROWSER_AND_PHONE: Slot[] = [
  { kind: "desktop", labelKey: "browser", key: "desktopImage" },
  { kind: "mobile", labelKey: "phone", key: "mobileImage" },
]

const ONE_PHONE: Slot[] = [{ kind: "mobile", labelKey: "phone", key: "mobileImage" }]

const ONE_BROWSER: Slot[] = [{ kind: "desktop", labelKey: "browser", key: "desktopImage" }]

// Une capture pleine page est plus haute que large : l'emplacement la prend comme
// une capture mobile, sans quoi une capture desktop ordinaire passerait devant.
const FULL_PAGE: Slot[] = [{ kind: "mobile", labelKey: "fullPage", key: "desktopImage" }]

// Avant / après : deux captures paysage, la plus ancienne en premier.
const TWO_BROWSERS: Slot[] = [
  { kind: "desktop", labelKey: "browserBefore", key: "desktopImage" },
  { kind: "desktop", labelKey: "browserAfter", key: "desktopImage2" },
]

const THREE_PHONES: Slot[] = [
  { kind: "mobile", labelKey: "phoneCenter", key: "mobileImage" },
  { kind: "mobile", labelKey: "phoneLeft", key: "mobileImage2" },
  { kind: "mobile", labelKey: "phoneRight", key: "mobileImage3" },
]

export const templates: Template[] = [
  {
    id: "showcase",
    nameKey: "showcaseName",
    descriptionKey: "showcaseDescription",
    size: COVER_SIZE,
    component: ShowcaseTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "dark", "colorful"],
  },
  {
    id: "spotlight",
    nameKey: "spotlightName",
    descriptionKey: "spotlightDescription",
    size: COVER_SIZE,
    component: SpotlightTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light", "minimal"],
  },
  {
    id: "bento",
    nameKey: "bentoName",
    descriptionKey: "bentoDescription",
    size: COVER_SIZE,
    component: BentoTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light"],
  },
  {
    id: "mobile-trio",
    nameKey: "mobileTrioName",
    descriptionKey: "mobileTrioDescription",
    size: COVER_SIZE,
    component: MobileTrioTemplate,
    schema: mobileTrioSchema,
    slots: THREE_PHONES,
    tags: ["mobile", "light", "minimal"],
  },
  {
    id: "editorial",
    nameKey: "editorialName",
    descriptionKey: "editorialDescription",
    size: COVER_SIZE,
    component: EditorialTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light", "minimal"],
  },
  {
    id: "aurora",
    nameKey: "auroraName",
    descriptionKey: "auroraDescription",
    size: COVER_SIZE,
    component: AuroraTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "dark", "colorful"],
  },
  {
    id: "brutal",
    nameKey: "brutalName",
    descriptionKey: "brutalDescription",
    size: COVER_SIZE,
    component: BrutalTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light", "colorful", "playful"],
  },
  {
    id: "poster",
    nameKey: "posterName",
    descriptionKey: "posterDescription",
    size: COVER_SIZE,
    component: PosterTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "colorful", "playful"],
  },
  {
    id: "sunburst",
    nameKey: "sunburstName",
    descriptionKey: "sunburstDescription",
    size: COVER_SIZE,
    component: SunburstTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light", "colorful", "playful"],
  },
  {
    id: "store",
    nameKey: "storeName",
    descriptionKey: "storeDescription",
    size: COVER_SIZE,
    component: StoreTemplate,
    schema: mobileTrioSchema,
    slots: THREE_PHONES,
    tags: ["mobile", "light", "colorful"],
  },
  {
    id: "focus",
    nameKey: "focusName",
    descriptionKey: "focusDescription",
    size: COVER_SIZE,
    component: FocusTemplate,
    schema: mobileTrioSchema,
    slots: THREE_PHONES,
    tags: ["mobile", "dark"],
  },
  {
    id: "callouts",
    nameKey: "calloutsName",
    descriptionKey: "calloutsDescription",
    size: COVER_SIZE,
    component: CalloutsTemplate,
    schema: mobileTrioSchema,
    slots: ONE_PHONE,
    tags: ["mobile", "light", "playful"],
  },
  {
    id: "wall",
    nameKey: "wallName",
    descriptionKey: "wallDescription",
    size: COVER_SIZE,
    component: WallTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "dark"],
  },
  {
    id: "brandboard",
    nameKey: "brandboardName",
    descriptionKey: "brandboardDescription",
    size: COVER_SIZE,
    component: BrandboardTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light", "colorful"],
  },
  {
    id: "studio",
    nameKey: "studioName",
    descriptionKey: "studioDescription",
    size: COVER_SIZE,
    component: StudioTemplate,
    schema: noBrowserBarSchema,
    slots: ONE_BROWSER,
    tags: ["desktop", "dark", "minimal"],
  },
  {
    id: "devices",
    nameKey: "devicesName",
    descriptionKey: "devicesDescription",
    size: COVER_SIZE,
    component: DevicesTemplate,
    schema: noBrowserBarSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light"],
  },
  {
    id: "longscroll",
    nameKey: "longscrollName",
    descriptionKey: "longscrollDescription",
    size: COVER_SIZE,
    component: LongscrollTemplate,
    schema: noBrowserBarSchema,
    slots: FULL_PAGE,
    tags: ["desktop", "colorful"],
  },
  {
    id: "closeup",
    nameKey: "closeupName",
    descriptionKey: "closeupDescription",
    size: COVER_SIZE,
    component: CloseupTemplate,
    schema: mobileTrioSchema,
    slots: ONE_PHONE,
    tags: ["mobile", "light", "minimal"],
  },
  {
    id: "flatlay",
    nameKey: "flatlayName",
    descriptionKey: "flatlayDescription",
    size: COVER_SIZE,
    component: FlatlayTemplate,
    schema: mobileTrioSchema,
    slots: THREE_PHONES,
    tags: ["mobile", "light", "playful"],
  },
  {
    id: "metrics",
    nameKey: "metricsName",
    descriptionKey: "metricsDescription",
    size: COVER_SIZE,
    component: MetricsTemplate,
    schema: metricsSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "dark"],
  },
  {
    id: "blueprint",
    nameKey: "blueprintName",
    descriptionKey: "blueprintDescription",
    size: COVER_SIZE,
    component: BlueprintTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "dark", "minimal"],
  },
  {
    id: "scrapbook",
    nameKey: "scrapbookName",
    descriptionKey: "scrapbookDescription",
    size: COVER_SIZE,
    component: ScrapbookTemplate,
    schema: noBrowserBarSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "light", "playful"],
  },
  {
    id: "desktop",
    nameKey: "desktopName",
    descriptionKey: "desktopDescription",
    size: COVER_SIZE,
    component: DesktopTemplate,
    schema: baseSchema,
    slots: BROWSER_AND_PHONE,
    tags: ["desktop", "colorful", "playful"],
  },
  {
    id: "compare",
    nameKey: "compareName",
    descriptionKey: "compareDescription",
    size: COVER_SIZE,
    component: CompareTemplate,
    schema: baseSchema,
    slots: TWO_BROWSERS,
    tags: ["desktop", "light", "minimal"],
  },
  {
    id: "quote",
    nameKey: "quoteName",
    descriptionKey: "quoteDescription",
    size: COVER_SIZE,
    component: QuoteTemplate,
    schema: mobileTrioSchema,
    slots: ONE_PHONE,
    tags: ["mobile", "light", "playful"],
  },
]

export function getTemplate(id: string | undefined): Template {
  return templates.find((template) => template.id === id) ?? templates[0]
}
