import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppFooter } from '@/components/app-footer'
import { formatError } from '@/lib/i18n/format'
import { MAX_SEATS, MIN_SEATS_TO_START } from '@/multiplayer/protocol'
import { useSessionStore } from '@/stores/session'

/** Waiting room between joining and the host starting the game. */
export function LobbyScreen() {
  const { t } = useTranslation()
  const code = useSessionStore((state) => state.code)
  const players = useSessionStore((state) => state.players)
  const seat = useSessionStore((state) => state.seat)
  const error = useSessionStore((state) => state.error)
  const reconnecting = useSessionStore((state) => state.reconnecting)
  const start = useSessionStore((state) => state.start)
  const leave = useSessionStore((state) => state.leave)

  const isHost = seat === 0
  const enough = players.length >= MIN_SEATS_TO_START

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-4 p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">{t('app.subtitle')}</p>
          <h1 className="text-4xl font-black tracking-tight">
            {t('lobby.title', { code: code ?? '' })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('lobby.shareCode')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {reconnecting && (
        <p className="rounded-md bg-accent p-2 text-sm text-accent-foreground" role="status">
          {t('online.reconnecting')}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
        >
          {formatError(error, t)}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {t('lobby.players', { count: players.length, max: MAX_SEATS })}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-1">
            {players.map((player, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span
                    aria-hidden
                    className={
                      player.connected
                        ? 'size-2 rounded-full bg-primary'
                        : 'size-2 rounded-full bg-destructive'
                    }
                  />
                  {player.name}
                  {!player.connected && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {t('lobby.disconnected')}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {index === 0 && t('lobby.host')}
                  {index === 0 && index === seat && ' · '}
                  {index === seat && t('lobby.you')}
                </span>
              </li>
            ))}
          </ul>

          {isHost ? (
            <>
              {!enough && (
                <p className="rounded-md bg-accent p-2 text-xs text-accent-foreground">
                  {t('lobby.needTwo')}
                </p>
              )}
              <Button size="lg" disabled={!enough} onClick={start}>
                {t('lobby.start')}
              </Button>
            </>
          ) : (
            <p className="rounded-md bg-accent p-2 text-sm text-accent-foreground">
              {t('lobby.waitingForHost')}
            </p>
          )}

          <Button variant="outline" onClick={leave}>
            {t('lobby.leave')}
          </Button>
        </CardContent>
      </Card>

      <AppFooter />
    </div>
  )
}
