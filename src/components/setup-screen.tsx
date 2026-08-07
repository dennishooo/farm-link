import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppFooter } from '@/components/app-footer'

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
