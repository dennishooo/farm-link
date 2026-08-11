import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppFooter } from '@/components/app-footer'
import { formatError } from '@/lib/i18n/format'
import { ROOM_CODE_LENGTH } from '@/multiplayer/protocol'
import { useSessionStore } from '@/stores/session'

const inputClass = cn(
  'h-10 rounded-md border border-border bg-background px-3 text-sm font-normal',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
)

export function SetupScreen({ onStart }: { onStart: (names: string[]) => void }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'single' | 'online'>('single')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-4 p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">{t('app.subtitle')}</p>
          <h1 className="text-4xl font-black tracking-tight">{t('app.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('app.tagline')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <EndedNotice />

      <div className="flex gap-2" role="tablist">
        <Button
          role="tab"
          aria-selected={mode === 'single'}
          variant={mode === 'single' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setMode('single')}
        >
          {t('setup.modeSingle')}
        </Button>
        <Button
          role="tab"
          aria-selected={mode === 'online'}
          variant={mode === 'online' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setMode('online')}
        >
          {t('setup.modeOnline')}
        </Button>
      </div>

      {mode === 'single' ? <SinglePanel onStart={onStart} /> : <OnlinePanel />}

      <p className="text-center text-xs text-muted-foreground">
        {mode === 'single' ? t('app.offlineNote') : t('setup.onlineNote')}
      </p>
      <AppFooter />
    </div>
  )
}

/** The original pass-and-play setup, unchanged. */
function SinglePanel({ onStart }: { onStart: (names: string[]) => void }) {
  const { t } = useTranslation()
  const [count, setCount] = useState(2)
  // Empty means "use the localised default for this seat".
  const [names, setNames] = useState<string[]>(['', '', '', ''])

  const defaultName = (index: number) => t('setup.defaultName', { number: index + 1 })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('setup.players')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((value) => (
            <Button
              key={value}
              variant={count === value ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setCount(value)}
            >
              {value}
              <span className="sr-only"> {t('setup.playerCount', { count: value })}</span>
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {names.slice(0, count).map((name, index) => (
            <label key={index} className="flex flex-col gap-1 text-xs font-semibold">
              <span className="text-muted-foreground">
                {t('setup.playerLabel', { number: index + 1 })}
              </span>
              <input
                value={name}
                placeholder={defaultName(index)}
                maxLength={16}
                onChange={(event) => {
                  const next = [...names]
                  next[index] = event.target.value
                  setNames(next)
                }}
                className={inputClass}
              />
            </label>
          ))}
        </div>

        {count === 1 && (
          <p className="rounded-md bg-accent p-2 text-xs text-accent-foreground">
            {t('setup.soloNote')}
          </p>
        )}

        <Button
          size="lg"
          onClick={() =>
            onStart(names.slice(0, count).map((name, i) => name.trim() || defaultName(i)))
          }
        >
          {t('setup.start')}
        </Button>
      </CardContent>
    </Card>
  )
}

/** Create or join a room; the lobby takes over once a seat is granted. */
function OnlinePanel() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const status = useSessionStore((state) => state.status)
  const error = useSessionStore((state) => state.error)
  const createRoom = useSessionStore((state) => state.createRoom)
  const joinRoom = useSessionStore((state) => state.joinRoom)

  const trimmed = name.trim()
  const busy = status === 'connecting'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('setup.modeOnline')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
          >
            {formatError(error, t)}
          </p>
        )}

        <label className="flex flex-col gap-1 text-xs font-semibold">
          <span className="text-muted-foreground">{t('setup.yourName')}</span>
          <input
            value={name}
            placeholder={t('setup.defaultName', { number: 1 })}
            maxLength={16}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </label>

        <Button size="lg" disabled={!trimmed || busy} onClick={() => createRoom(trimmed)}>
          {t('setup.createRoom')}
        </Button>

        <div className="flex items-end gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">
            <span className="text-muted-foreground">{t('setup.roomCode')}</span>
            <input
              value={code}
              maxLength={ROOM_CODE_LENGTH}
              autoCapitalize="characters"
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className={cn(inputClass, 'font-mono uppercase tracking-widest')}
            />
          </label>
          <Button
            variant="outline"
            className="h-10"
            disabled={!trimmed || code.trim().length !== ROOM_CODE_LENGTH || busy}
            onClick={() => joinRoom(code, trimmed)}
          >
            {t('setup.joinRoom')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/** Shown once after a room ends, so returning players know why they're back here. */
function EndedNotice() {
  const { t } = useTranslation()
  const status = useSessionStore((state) => state.status)
  const endedReason = useSessionStore((state) => state.endedReason)
  const acknowledgeEnd = useSessionStore((state) => state.acknowledgeEnd)

  if (status !== 'ended') return null
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-accent p-3 text-sm text-accent-foreground">
      <span>{endedReason === 'expired' ? t('online.endedExpired') : t('online.endedByHost')}</span>
      <Button variant="outline" size="sm" onClick={acknowledgeEnd}>
        {t('online.backToSetup')}
      </Button>
    </div>
  )
}
