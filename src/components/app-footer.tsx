import { useTranslation } from 'react-i18next'
import { APP_VERSION, BUILD_DATE, CHANGELOG_URL } from '@/lib/version'

/**
 * Build identity, so a player reporting a problem can say which version they
 * are on — the app updates itself in the background, so "latest" is ambiguous.
 */
export function AppFooter({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <p className={className ?? 'py-2 text-center text-xs text-muted-foreground'}>
      <a
        href={CHANGELOG_URL}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        {t('app.version', { version: APP_VERSION })}
      </a>
      {' · '}
      {t('app.built', { date: BUILD_DATE })}
    </p>
  )
}
