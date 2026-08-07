import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Undo2 } from 'lucide-react'
import { ActionBoard } from '@/components/action-board'
import { ActionDialog } from '@/components/action-dialog'
import { CardPicker } from '@/components/card-picker'
import { AppFooter } from '@/components/app-footer'
import { actionModeFor } from '@/lib/actions'
import { PlayerPanel } from '@/components/player-panel'
import { SetupScreen } from '@/components/setup-screen'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { formatError, formatLogEntry } from '@/lib/i18n/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currentPlayer, workersLeft, type ActionPayload } from '@/game/engine'
import { HARVEST_ROUNDS } from '@/game/rules'
import { rankPlayers } from '@/game/scoring'
import { useGameStore } from '@/stores/game'
import type { ActionSpaceId } from '@/game/types'

/**
 * The fourteen rounds as a row of pips, with the six harvests drawn wider. The
 * header only ever said "Round 3 of 14", which tells you where you are but not
 * how close the next feeding is.
 */
function RoundTrack({ round, total }: { round: number; total: number }) {
  return (
    <ol aria-hidden className="mt-1.5 flex items-center gap-[3px]">
      {Array.from({ length: total }, (_, index) => {
        const number = index + 1
        const isHarvest = HARVEST_ROUNDS.includes(number)
        const isPast = number < round
        const isCurrent = number === round

        return (
          <li
            key={number}
            className={cn(
              'h-1.5 rounded-full transition-colors',
              isHarvest ? 'w-3.5' : 'w-1.5',
              isCurrent && 'bg-primary ring-2 ring-primary/30',
              !isCurrent && isPast && 'bg-primary/45',
              !isCurrent && !isPast && (isHarvest ? 'bg-grain' : 'bg-border'),
            )}
          />
        )
      })}
    </ol>
  )
}

export default function App() {
  const { t } = useTranslation()
  const game = useGameStore((state) => state.game)
  const error = useGameStore((state) => state.error)
  const startGame = useGameStore((state) => state.startGame)
  const play = useGameStore((state) => state.play)
  const resolveHarvest = useGameStore((state) => state.resolveHarvest)
  const skipWorker = useGameStore((state) => state.skipWorker)
  const convert = useGameStore((state) => state.convert)
  const adjustForCard = useGameStore((state) => state.adjustForCard)
  const moveAnimals = useGameStore((state) => state.moveAnimals)
  const undo = useGameStore((state) => state.undo)
  const canUndo = useGameStore((state) => state.history.length > 0)
  const clearError = useGameStore((state) => state.clearError)
  const abandon = useGameStore((state) => state.abandon)

  const [pendingSpace, setPendingSpace] = useState<ActionSpaceId | null>(null)

  if (!game) return <SetupScreen onStart={startGame} />

  const active = currentPlayer(game)
  const isFinished = game.phase === 'finished'
  const isHarvest = game.phase === 'harvest'

  function choose(spaceId: ActionSpaceId) {
    clearError()
    // Actions needing a board choice open a dialog; the rest resolve at once.
    if (actionModeFor(spaceId) === 'none') play(spaceId)
    else setPendingSpace(spaceId)
  }

  function confirmAction(payload: ActionPayload) {
    if (!pendingSpace) return
    play(pendingSpace, payload)
    setPendingSpace(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 p-3">
      <header className="surface-panel sticky top-0 z-30 -mx-3 flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 backdrop-blur">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-primary">
            {t('game.round', { round: game.round, total: game.maxRounds })}
            {HARVEST_ROUNDS.includes(game.round) && ` · ${t('game.harvestThisRound')}`}
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            {isFinished
              ? t('game.finalScores')
              : isHarvest
                ? t('game.harvest')
                : t('game.turn', { name: active.name })}
          </h1>
          {/* Fourteen rounds is the whole shape of a game of Agricola, and the
              harvests are what everyone is planning around. A row of pips shows
              both at a glance — the number alone never did. */}
          <RoundTrack round={game.round} total={game.maxRounds} />
        </div>
        <div className="flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {/* Offered even on the final scores: a misclick that ends the game is
              exactly when taking a move back matters most. */}
          {canUndo && (
            <Button variant="outline" size="sm" onClick={undo}>
              <Undo2 className="size-4" />
              {t('game.undo')}
            </Button>
          )}
          {!isFinished && !isHarvest && (
            <Button variant="outline" size="sm" onClick={skipWorker}>
              {t('game.passWorker')}
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={abandon}>
            {t('game.newGame')}
          </Button>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="animate-[var(--animate-fade-in)] rounded-lg border border-destructive border-l-4 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive shadow-[var(--shadow-tile)]"
        >
          {formatError(error, t)}
        </p>
      )}

      {isHarvest && (
        <Card>
          <CardHeader>
            <CardTitle>{t('harvestPanel.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t('harvestPanel.description')}</p>
            <Button onClick={resolveHarvest}>{t('harvestPanel.resolve')}</Button>
          </CardContent>
        </Card>
      )}

      {isFinished && (
        <Card>
          <CardHeader>
            <CardTitle>{t('game.results')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-1">
              {rankPlayers(game.players).map(({ player, score, rank }) => (
                <li
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md border-b border-border px-2 py-1.5 text-sm last:border-0',
                    // The winner is the one thing this screen exists to say.
                    rank === 1 &&
                      'border-b-0 bg-grain/25 font-bold shadow-[var(--shadow-tile)] ring-1 ring-grain/50',
                  )}
                >
                  <span className="font-semibold">
                    {rank}. {player.name}
                  </span>
                  <span className="font-bold tabular-nums">
                    {t('game.points', { count: score.total })}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">{t('game.farms')}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {game.players.map((player, index) => (
              <PlayerPanel
                key={player.id}
                player={player}
                playerIndex={index}
                isCurrent={!isFinished && index === game.currentPlayerIndex}
                showScore={isFinished}
                onConvert={convert}
                onMoveAnimals={moveAnimals}
                onAdjustForCard={adjustForCard}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">
            {t('game.actionBoard')}
            {!isFinished &&
              !isHarvest &&
              ` · ${t('game.workersLeft', { count: workersLeft(active) })}`}
          </h2>
          <ActionBoard game={game} onChoose={choose} disabled={isFinished || isHarvest} />
        </section>
      </div>

      <details className="surface-panel rounded-xl border border-border p-3">
        <summary className="cursor-pointer text-sm font-bold">{t('game.gameLog')}</summary>
        <ol className="mt-2 flex flex-col-reverse gap-1 text-xs text-muted-foreground">
          {game.log.slice(-40).map((entry, index) => (
            <li key={index} className="flex gap-1.5">
              <span className="shrink-0 rounded-sm bg-muted px-1 font-semibold tabular-nums">
                R{entry.round}
              </span>
              <span>{formatLogEntry(entry, t)}</span>
            </li>
          ))}
        </ol>
      </details>

      <AppFooter />

      {pendingSpace && actionModeFor(pendingSpace) === 'card' && (
        <CardPicker
          spaceId={pendingSpace}
          game={game}
          player={active}
          onConfirm={(cardId, costOption) => {
            play(pendingSpace, { cardId, costOption })
            setPendingSpace(null)
          }}
          onCancel={() => setPendingSpace(null)}
        />
      )}

      {pendingSpace && actionModeFor(pendingSpace) !== 'card' && (
        <ActionDialog
          spaceId={pendingSpace}
          player={active}
          onConfirm={confirmAction}
          onCancel={() => setPendingSpace(null)}
        />
      )}
    </div>
  )
}
