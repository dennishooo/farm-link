import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppFooter } from '@/components/app-footer'

/**
 * The title badge: an oval roundel with a stippled ground and the farm inside
 * it, which is the shape Cloud Mountain builds its whole identity out of.
 *
 * Drawn from the same tokens as the board — the same pasture green, the same
 * clay roof, the same fence timber — so the setup screen and the game look like
 * one piece of work, and it recolours itself in dark mode for free. Inline SVG
 * rather than an image: nothing to fetch, and it stays sharp on a phone, which
 * matters for an app that has to cold-start with no connection.
 */
function FarmRoundel() {
  return (
    <svg
      viewBox="0 0 200 240"
      role="presentation"
      aria-hidden
      className="h-44 w-auto drop-shadow-[0_8px_16px_var(--shade)]"
    >
      <defs>
        <clipPath id="roundel-clip">
          <ellipse cx="100" cy="120" rx="92" ry="112" />
        </clipPath>
        {/* The stipple, as an actual pattern so the dots stay round and even
            however the badge is scaled. */}
        <pattern id="roundel-stipple" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.35" fill="var(--color-primary)" opacity="0.5" />
        </pattern>
      </defs>

      <g clipPath="url(#roundel-clip)">
        <rect width="200" height="240" fill="var(--color-card)" />
        <rect width="200" height="240" fill="url(#roundel-stipple)" />

        {/* Sun, hills, and the stipple stopping where the land begins. */}
        <circle cx="150" cy="58" r="20" fill="var(--grain)" />
        <path d="M-10 150 Q50 120 100 142 T210 138 V250 H-10Z" fill="var(--pasture)" opacity="0.65" />
        <path d="M-10 172 Q60 148 120 168 T210 166 V250 H-10Z" fill="var(--pasture)" />

        {/* A ploughed strip along the bottom, drawn as furrows. */}
        <path d="M-10 206 Q70 196 210 202 V250 H-10Z" fill="var(--field)" />
        <g stroke="var(--color-card)" strokeOpacity="0.3" strokeWidth="2" fill="none">
          <path d="M-10 216 Q70 206 210 212" />
          <path d="M-10 228 Q70 219 210 224" />
        </g>

        {/* The farmhouse: timber walls, a clay roof, a lit window. */}
        <rect x="52" y="150" width="52" height="34" rx="2" fill="var(--wood)" />
        <path d="M44 152 L78 124 L112 152Z" fill="var(--clay)" />
        <rect x="60" y="160" width="14" height="13" rx="1" fill="var(--grain)" />
        <rect x="84" y="164" width="14" height="20" rx="1" fill="var(--cattle)" opacity="0.8" />

        {/* An orchard tree and a run of fencing. */}
        <rect x="128" y="158" width="5" height="26" rx="2.5" fill="var(--wood)" />
        <g fill="var(--color-primary)">
          <circle cx="130.5" cy="150" r="14" opacity="0.9" />
          <circle cx="121" cy="157" r="9" opacity="0.75" />
          <circle cx="140" cy="157" r="9" opacity="0.75" />
        </g>
        <g fill="var(--wood)">
          <rect x="150" y="176" width="4" height="20" rx="1" />
          <rect x="174" y="176" width="4" height="20" rx="1" />
          <rect x="150" y="180" width="34" height="3" rx="1.5" opacity="0.9" />
          <rect x="150" y="188" width="34" height="3" rx="1.5" opacity="0.9" />
        </g>

        {/* A sheep in the near pasture. */}
        <g fill="var(--sheep)">
          <rect x="26" y="192" width="3.5" height="8" rx="1.75" />
          <rect x="37" y="192" width="3.5" height="8" rx="1.75" />
          <ellipse cx="33" cy="189" rx="12" ry="8" />
          <circle cx="44" cy="184" r="5.5" opacity="0.7" />
        </g>
      </g>

      {/* The keyline last, so it sits over everything it contains. */}
      <ellipse
        cx="100"
        cy="120"
        rx="92"
        ry="112"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="4"
      />
    </svg>
  )
}

export function SetupScreen({ onStart }: { onStart: (names: string[]) => void }) {
  const { t } = useTranslation()
  const [count, setCount] = useState(2)
  // Empty means "use the localised default for this seat".
  const [names, setNames] = useState<string[]>(['', '', '', ''])

  const defaultName = (index: number) => t('setup.defaultName', { number: index + 1 })

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-4 p-4">
      {/* Centred like the reference lockups: badge, then the name stacked
          under it, with the controls kept out of the composition. */}
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <header className="flex flex-col items-center gap-2 text-center">
        <FarmRoundel />
        <p className="eyebrow text-highlight">{t('app.subtitle')}</p>
        <h1 className="display text-5xl">{t('app.title')}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{t('app.tagline')}</p>
      </header>

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
