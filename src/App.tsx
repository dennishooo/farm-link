import { useState } from 'react'
import { ActionBoard } from '@/components/action-board'
import { ActionDialog } from '@/components/action-dialog'
import { actionModeFor } from '@/lib/actions'
import { PlayerPanel } from '@/components/player-panel'
import { SetupScreen } from '@/components/setup-screen'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currentPlayer, workersLeft, type ActionPayload } from '@/game/engine'
import { HARVEST_ROUNDS } from '@/game/rules'
import { rankPlayers } from '@/game/scoring'
import { useGameStore } from '@/stores/game'
import type { ActionSpaceId } from '@/game/types'

export default function App() {
  const game = useGameStore((state) => state.game)
  const error = useGameStore((state) => state.error)
  const startGame = useGameStore((state) => state.startGame)
  const play = useGameStore((state) => state.play)
  const resolveHarvest = useGameStore((state) => state.resolveHarvest)
  const skipWorker = useGameStore((state) => state.skipWorker)
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
            Round {game.round} of {game.maxRounds}
            {HARVEST_ROUNDS.includes(game.round) && ' · harvest this round'}
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            {isFinished ? 'Final scores' : isHarvest ? 'Harvest' : `${active.name}'s turn`}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isFinished && !isHarvest && (
            <Button variant="outline" size="sm" onClick={skipWorker}>
              Pass worker
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={abandon}>
            New game
          </Button>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
        >
          {error}
        </p>
      )}

      {isHarvest && (
        <Card>
          <CardHeader>
            <CardTitle>Harvest time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Fields give one crop each, then every person eats (2 food, newborns 1), then animals
              breed. Grain and vegetables in your supply count as 1 food each if you fall short.
            </p>
            <Button onClick={resolveHarvest}>Resolve harvest</Button>
          </CardContent>
        </Card>
      )}

      {isFinished && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
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
                  <span className="font-bold">{score.total} pts</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">Farms</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {game.players.map((player, index) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrent={!isFinished && index === game.currentPlayerIndex}
                showScore={isFinished}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">
            Action board
            {!isFinished && !isHarvest && ` · ${workersLeft(active)} worker(s) left`}
          </h2>
          <ActionBoard game={game} onChoose={choose} disabled={isFinished || isHarvest} />
        </section>
      </div>

      <details className="rounded-lg border border-border bg-card p-3">
        <summary className="cursor-pointer text-sm font-bold">Game log</summary>
        <ol className="mt-2 flex flex-col-reverse gap-1 text-xs text-muted-foreground">
          {game.log.slice(-40).map((entry, index) => (
            <li key={index}>
              <span className="font-semibold">R{entry.round}</span> · {entry.message}
            </li>
          ))}
        </ol>
      </details>

      {pendingSpace && (
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
