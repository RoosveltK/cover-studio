"use client"

import { useRouter } from "next/navigation"

import { saveLocale } from "@/i18n/detect"
import { localizePath, usePathname } from "@/i18n/navigation"
import { useLocale, useTranslations } from "@/i18n/provider"
import { LOCALE_NAMES, hasLocale, locales, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  /** `onGradient` : texte blanc, pour la barre colorée de l'éditeur. */
  tone?: "default" | "onGradient"
  className?: string
  /** Chemin équivalent par langue (page sans traduction → Landing). Sinon, la page courante. */
  paths?: Partial<Record<Locale, string>>
}

const ITEMS = locales.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] }))

export function LocaleSwitcher({ tone = "default", className, paths }: Props) {
  const t = useTranslations("localeSwitcher")
  const current = useLocale()
  // Chemin sans préfixe de langue : on ajoute celui de la langue cible.
  const pathname = usePathname()
  const router = useRouter()

  function change(locale: string | null) {
    if (!hasLocale(locale) || locale === current) return
    saveLocale(locale)
    router.push(localizePath(locale, paths?.[locale] ?? pathname))
  }

  return (
    <Select value={current} onValueChange={change} items={ITEMS}>
      <SelectTrigger
        aria-label={t("label")}
        className={cn(
          "h-8 w-auto min-w-[88px] px-2 text-xs font-semibold",
          tone === "onGradient" &&
            "border-white/30 bg-white/10 text-white focus-visible:ring-white/60",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ITEMS.map(({ value, label }) => (
          <SelectItem key={value} value={value} lang={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
