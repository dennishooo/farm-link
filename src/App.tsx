import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currentPlayer, workersLeft, type ActionPayload } from '@/game/engine'
import { HARVEST_ROUNDS } from '@/game/rules'
import { rankPlayers } from '@/game/scoring'
import { useGameStore } from '@/stores/game'
import type { ActionSpaceId } from '@/game/types'

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
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-primary">
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
        </div>
        <div className="flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
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
          className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
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
                  className="flex justify-between border-b border-border py-1 text-sm last:border-0"
                >
                  <span className="font-semibold">
                    {rank}. {player.name}
                  </span>
                  <span className="font-bold">{t('game.points', { count: score.total })}</span>
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

      <details className="rounded-lg border border-border bg-card p-3">
        <summary className="cursor-pointer text-sm font-bold">{t('game.gameLog')}</summary>
        <ol className="mt-2 flex flex-col-reverse gap-1 text-xs text-muted-foreground">
          {game.log.slice(-40).map((entry, index) => (
            <li key={index}>
              <span className="font-semibold">R{entry.round}</span> · {formatLogEntry(entry, t)}
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
