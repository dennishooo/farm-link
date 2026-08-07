import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()

  // i18n.language may be a regional variant (zh-TW); match on the base tag.
  const current =
    SUPPORTED_LANGUAGES.find((language) => i18n.language?.startsWith(language.code))?.code ??
    SUPPORTED_LANGUAGES.find((language) => i18n.language?.startsWith(language.code.split('-')[0]))
      ?.code ??
    'en'

  return (
    <select
      value={current}
      onChange={(event) => i18n.changeLanguage(event.target.value)}
      aria-label={t('language.label')}
      className={cn(
        'h-8 rounded-md border border-border bg-card px-2 text-sm font-semibold text-card-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  )
}
