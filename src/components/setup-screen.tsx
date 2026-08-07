import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppFooter } from '@/components/app-footer'

/**
 * The title card. It is drawn from the same tokens as the board — the same
 * pasture green, the same clay roof, the same fence timber — so the setup
 * screen and the game look like one piece of work, and it recolours itself in
 * dark mode for free. Inline SVG rather than an image: nothing to fetch, and
 * it stays sharp on a phone, which matters for an app that has to cold-start
 * with no connection.
 */
function FarmVignette() {
  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-panel)]">
      <svg viewBox="0 0 400 130" role="presentation" aria-hidden className="block h-auto w-full">
        <defs>
          <linearGradient id="farm-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-card)" />
          </linearGradient>
        </defs>

        <rect width="400" height="130" fill="url(#farm-sky)" />
        <circle cx="332" cy="32" r="15" fill="var(--grain)" opacity="0.9" />

        {/* Two ridges of pasture, the far one hazier than the near one. */}
        <path d="M0 84 Q70 60 140 78 T280 72 T400 82 V130 H0Z" fill="var(--pasture)" opacity="0.5" />
        <path d="M0 100 Q100 78 200 96 T400 96 V130 H0Z" fill="var(--pasture)" />

        {/* A ploughed strip running to the bottom corner, drawn as furrows
            rather than a block of colour. */}
        <path d="M262 118 Q330 110 400 112 V130 H262Z" fill="var(--field)" opacity="0.9" />
        <g stroke="var(--color-card)" strokeOpacity="0.3" strokeWidth="1.4">
          <path d="M266 123 Q332 116 400 118" fill="none" />
          <path d="M272 128 Q336 122 400 124" fill="none" />
        </g>

        {/* The farmhouse: timber walls, a clay roof, a lit window. */}
        <rect x="64" y="86" width="48" height="30" rx="2" fill="var(--wood)" />
        <path d="M58 88 L88 64 L118 88Z" fill="var(--clay)" />
        <rect x="72" y="95" width="13" height="12" rx="1" fill="var(--grain)" />
        <rect x="94" y="99" width="13" height="17" rx="1" fill="var(--cattle)" opacity="0.8" />

        {/* An orchard tree, and fencing running along the pasture. */}
        <rect x="166" y="92" width="5" height="24" rx="2" fill="var(--wood)" />
        <g fill="var(--color-primary)">
          <circle cx="168.5" cy="86" r="13" opacity="0.9" />
          <circle cx="160" cy="92" r="9" opacity="0.75" />
          <circle cx="177" cy="92" r="9" opacity="0.75" />
        </g>
        <g fill="var(--wood)">
          <rect x="200" y="98" width="4" height="20" rx="1" />
          <rect x="226" y="98" width="4" height="20" rx="1" />
          <rect x="252" y="98" width="4" height="20" rx="1" />
          <rect x="200" y="102" width="56" height="3" rx="1.5" opacity="0.9" />
          <rect x="200" y="110" width="56" height="3" rx="1.5" opacity="0.9" />
        </g>

        {/* Two sheep in the near pasture, drawn the same way at two sizes. */}
        <g fill="var(--sheep)">
          <rect x="20" y="115" width="3.5" height="8" rx="1.75" />
          <rect x="31" y="115" width="3.5" height="8" rx="1.75" />
          <ellipse cx="27" cy="112" rx="12" ry="8" />
          <circle cx="38" cy="107" r="5.5" opacity="0.7" />
          <rect x="124" y="120" width="2.5" height="6" rx="1.25" />
          <rect x="132" y="120" width="2.5" height="6" rx="1.25" />
          <ellipse cx="129" cy="118" rx="9" ry="6" />
          <circle cx="137" cy="114" r="4" opacity="0.7" />
        </g>
      </svg>
    </div>
  )
}

export function SetupScreen({ onStart }: { onStart: (names: string[]) => void }) {
  const { t } = useTranslation()
  const [count, setCount] = useState(2)
  // Empty means "use the localised default for this seat".
  const [names, setNames] = useState<string[]>(['', '', '', ''])

  const defaultName = (index: number) => t('setup.defaultName', { number: index + 1 })

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

      <FarmVignette />

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
                  className={cn(
                    'h-10 rounded-md border border-border bg-background px-3 text-sm font-normal',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  )}
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

      <p className="text-center text-xs text-muted-foreground">
        {t('app.offlineNote')}
      </p>
      <AppFooter />
    </div>
  )
}
