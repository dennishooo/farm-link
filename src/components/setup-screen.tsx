import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4']

export function SetupScreen({ onStart }: { onStart: (names: string[]) => void }) {
  const [count, setCount] = useState(2)
  const [names, setNames] = useState(DEFAULT_NAMES)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-4 p-4">
      <header>
        <p className="text-sm font-bold text-primary">Agricola · Revised Edition</p>
        <h1 className="text-4xl font-black tracking-tight">FarmLink</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass-and-play on one device. Fourteen rounds, six harvests, one farm to build.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
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
                <span className="sr-only"> player{value > 1 ? 's' : ''}</span>
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {names.slice(0, count).map((name, index) => (
              <label key={index} className="flex flex-col gap-1 text-xs font-semibold">
                <span className="text-muted-foreground">Player {index + 1}</span>
                <input
                  value={name}
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
              Solo game: your adults eat 3 food each and the Forest only grows 2 wood per round.
            </p>
          )}

          <Button
            size="lg"
            onClick={() =>
              onStart(names.slice(0, count).map((name, i) => name.trim() || DEFAULT_NAMES[i]))
            }
          >
            Start game
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Works offline. Your game is saved in this browser.
      </p>
    </div>
  )
}
