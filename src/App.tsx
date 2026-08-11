import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Redo2, Undo2 } from 'lucide-react'
import { ActionBoard } from '@/components/action-board'
import { ActionDialog } from '@/components/action-dialog'
import { CardPicker } from '@/components/card-picker'
import { AppFooter } from '@/components/app-footer'
import { actionModeFor } from '@/lib/actions'
import { PlayerPanel } from '@/components/player-panel'
import { SetupScreen } from '@/components/setup-screen'
import { LobbyScreen } from '@/components/lobby-screen'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { formatError, formatLogEntry } from '@/lib/i18n/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  cardActionNeedsTarget,
  currentPlayer,
  workersLeft,
  type ActionPayload,
  type CardAction,
  type CardActionPayload,
  type TargetedCardAction,
} from '@/game/engine'
import { HARVEST_ROUNDS } from '@/game/rules'
import { rankPlayers } from '@/game/scoring'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'
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
              isCurrent && 'bg-highlight ring-2 ring-highlight/30',
              !isCurrent && isPast && 'bg-primary/45',
              !isCurrent && !isPast && (isHarvest ? 'bg-grain' : 'bg-border'),
            )}
          />
        )
      })}
    </ol>
  )
}

/** 'plow' becomes 'Plow', to reach the `cards.actionPlow` key. */
function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function App() {
  const { t } = useTranslation()
  const localGame = useGameStore((state) => state.game)
  const localError = useGameStore((state) => state.error)
  const startGame = useGameStore((state) => state.startGame)
  const localPlay = useGameStore((state) => state.play)
  const localResolveHarvest = useGameStore((state) => state.resolveHarvest)
  const localSkipWorker = useGameStore((state) => state.skipWorker)
  const localConvert = useGameStore((state) => state.convert)
  const localAdjustForCard = useGameStore((state) => state.adjustForCard)
  const localCardAction = useGameStore((state) => state.cardAction)
  const localTransfer = useGameStore((state) => state.transfer)
  const localMoveAnimals = useGameStore((state) => state.moveAnimals)
  const undo = useGameStore((state) => state.undo)
  const localCanUndo = useGameStore((state) => state.history.length > 0)
  const redo = useGameStore((state) => state.redo)
  const localCanRedo = useGameStore((state) => state.future.length > 0)
  const localClearError = useGameStore((state) => state.clearError)
  const abandon = useGameStore((state) => state.abandon)

  const sessionStatus = useSessionStore((state) => state.status)
  const sessionGame = useSessionStore((state) => state.game)
  const sessionError = useSessionStore((state) => state.error)
  const seat = useSessionStore((state) => state.seat)
  const code = useSessionStore((state) => state.code)
  const reconnecting = useSessionStore((state) => state.reconnecting)
  const sendIntent = useSessionStore((state) => state.sendIntent)
  const leaveSession = useSessionStore((state) => state.leave)
  const endSession = useSessionStore((state) => state.endGame)
  const sessionClearError = useSessionStore((state) => state.clearError)
  const acknowledgeEnd = useSessionStore((state) => state.acknowledgeEnd)

  const [pendingSpace, setPendingSpace] = useState<ActionSpaceId | null>(null)
  // A card effect that still needs a place on the board picked for it.
  const [pendingCard, setPendingCard] = useState<{
    playerIndex: number
    cardId: string
    action: TargetedCardAction
  } | null>(null)

  // An online session, once seated, replaces the local game until it ends.
  const online = sessionStatus === 'playing' && sessionGame !== null
  const game = online ? sessionGame : localGame

  // Starting a local game from the setup screen also dismisses a lingering
  // "room ended" notice, so the app cannot get stuck behind it.
  function handleStart(names: string[]) {
    if (sessionStatus === 'ended') acknowledgeEnd()
    startGame(names)
  }

  if (sessionStatus === 'lobby') return <LobbyScreen />
  // A finished room shows the setup screen (with its ended notice) even when
  // a saved local game exists; acknowledging returns to that game.
  if (sessionStatus === 'ended') return <SetupScreen onStart={handleStart} />
  if (!game || (sessionStatus === 'playing' && !sessionGame)) {
    return <SetupScreen onStart={handleStart} />
  }

  // In online mode every mutation travels to the server as an intent; the
  // next state broadcast updates the screen. Locally they hit the store.
  const play = online
    ? (spaceId: ActionSpaceId, payload?: ActionPayload) =>
        sendIntent({ kind: 'play', spaceId, payload })
    : localPlay
  const resolveHarvest = online ? () => sendIntent({ kind: 'resolveHarvest' }) : localResolveHarvest
  const skipWorker = online ? () => sendIntent({ kind: 'skipWorker' }) : localSkipWorker
  const convert = online
    ? (...args: Parameters<typeof localConvert>) =>
        sendIntent({ kind: 'convert', playerIndex: args[0], cardId: args[1], units: args[2], good: args[3] })
    : localConvert
  const adjustForCard = online
    ? (...args: Parameters<typeof localAdjustForCard>) =>
        sendIntent({ kind: 'adjustForCard', playerIndex: args[0], cardId: args[1], good: args[2], delta: args[3] })
    : localAdjustForCard
  const moveAnimals = online
    ? (...args: Parameters<typeof localMoveAnimals>) =>
        sendIntent({ kind: 'moveAnimals', playerIndex: args[0], fromKey: args[1], toKey: args[2], count: args[3] })
    : localMoveAnimals
  const cardAction = online
    ? (...args: Parameters<typeof localCardAction>) =>
        sendIntent({ kind: 'cardAction', playerIndex: args[0], cardId: args[1], action: args[2], payload: args[3] })
    : localCardAction
  const transfer = online
    ? (...args: Parameters<typeof localTransfer>) =>
        sendIntent({ kind: 'transfer', fromIndex: args[0], toIndex: args[1], cardId: args[2], good: args[3], amount: args[4] })
    : localTransfer
  // Undo rewinds this device's own store, which the server knows nothing
  // about. Offering it online would desync the board, so it stays offline-only.
  const canUndo = !online && localCanUndo
  const canRedo = !online && localCanRedo
  const error = online ? sessionError : localError
  const clearError = online ? sessionClearError : localClearError

  const active = currentPlayer(game)
  const isFinished = game.phase === 'finished'
  const isHarvest = game.phase === 'harvest'
  // On one device whoever holds it acts for everyone; online each device
  // acts only for its own seat, and only the host resolves shared steps.
  const isMyTurn = !online || game.currentPlayerIndex === seat
  const isHost = !online || seat === 0
  const mayEditFarm = (index: number) => !online || index === seat

  function choose(spaceId: ActionSpaceId) {
    clearError()
    // Actions needing a board choice open a dialog; the rest resolve at once.
    if (actionModeFor(spaceId) === 'none') play(spaceId)
    else setPendingSpace(spaceId)
  }

  /**
   * Apply a card effect. The ones that put something on the farm borrow the
   * action board's own picker, so a card-granted room is placed under exactly
   * the same adjacency rules as a bought one.
   */
  function beginCardAction(
    playerIndex: number,
    cardId: string,
    action: CardAction,
    payload?: CardActionPayload,
  ) {
    clearError()
    if (cardActionNeedsTarget(action)) setPendingCard({ playerIndex, cardId, action })
    else cardAction(playerIndex, cardId, action, payload)
  }

  function confirmAction(payload: ActionPayload) {
    if (!pendingSpace) return
    play(pendingSpace, payload)
    setPendingSpace(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 p-3">
      <header className="board-ground sticky top-0 z-30 -mx-3 flex flex-wrap items-center justify-between gap-2 rounded-b-xl px-3 py-2.5 shadow-[var(--shadow-panel)]">
        <div>
          <p className="eyebrow flex items-center gap-2 text-highlight">
            {t('game.round', { round: game.round, total: game.maxRounds })}
            {HARVEST_ROUNDS.includes(game.round) && ` · ${t('game.harvestThisRound')}`}
            {online && ` · ${t('online.roomCode', { code: code ?? '' })}`}
            {online && ` · ${t('online.youAre', { name: game.players[seat]?.name ?? '' })}`}
          </p>
          <h1 className="display text-2xl">
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
          {canRedo && (
            <Button variant="outline" size="sm" onClick={redo}>
              <Redo2 className="size-4" />
              {t('game.redo')}
            </Button>
          )}
          {!isFinished && !isHarvest && isMyTurn && (
            <Button variant="outline" size="sm" onClick={skipWorker}>
              {t('game.passWorker')}
            </Button>
          )}
          {online ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={isHost ? endSession : leaveSession}
            >
              {isHost ? t('online.endGame') : t('online.leaveGame')}
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={abandon}>
              {t('game.newGame')}
            </Button>
          )}
        </div>
      </header>

      {online && reconnecting && (
        <p role="status" className="rounded-md bg-accent p-2 text-sm text-accent-foreground">
          {t('online.reconnecting')}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="animate-[var(--animate-fade-in)] rounded-lg border border-destructive border-l-4 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive-text shadow-[var(--shadow-tile)]"
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
            {isHost ? (
              <Button onClick={resolveHarvest}>{t('harvestPanel.resolve')}</Button>
            ) : (
              <p className="rounded-md bg-accent p-2 text-sm text-accent-foreground">
                {t('online.hostResolves')}
              </p>
            )}
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
                      'border-b-0 bg-grain/25 font-bold shadow-[var(--shadow-tile)] ring-1 ring-grain/60',
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
          <h2 className="eyebrow text-muted-foreground">{t('game.farms')}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {game.players.map((player, index) => (
              <PlayerPanel
                key={player.id}
                player={player}
                playerIndex={index}
                isCurrent={!isFinished && index === game.currentPlayerIndex}
                showScore={isFinished}
                onConvert={mayEditFarm(index) ? convert : undefined}
                onMoveAnimals={mayEditFarm(index) ? moveAnimals : undefined}
                onAdjustForCard={mayEditFarm(index) ? adjustForCard : undefined}
                onCardAction={mayEditFarm(index) ? beginCardAction : undefined}
                opponents={game.players
                  .map((other, otherIndex) => ({ index: otherIndex, name: other.name }))
                  .filter((other) => other.index !== index)}
                onTransfer={mayEditFarm(index) ? transfer : undefined}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="eyebrow text-muted-foreground">
            {t('game.actionBoard')}
            {!isFinished &&
              !isHarvest &&
              ` · ${t('game.workersLeft', { count: workersLeft(active) })}`}
          </h2>
          <ActionBoard game={game} onChoose={choose} disabled={isFinished || isHarvest || !isMyTurn} />
        </section>
      </div>

      <details className="surface-panel rounded-xl border border-border p-3">
        <summary className="eyebrow cursor-pointer">{t('game.gameLog')}</summary>
        <ol className="mt-2 flex flex-col-reverse gap-1 text-xs text-muted-foreground">
          {game.log.slice(-40).map((entry, index) => (
            <li key={index} className="flex gap-1.5">
              <span className="shrink-0 rounded-full bg-muted px-1.5 font-semibold tabular-nums">
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

      {pendingCard && (
        <ActionDialog
          spaceId={pendingCard.action}
          mode={pendingCard.action}
          title={t(`cards.action${capitalise(pendingCard.action)}` as 'cards.actionPlow')}
          player={game.players[pendingCard.playerIndex]}
          onConfirm={(payload) => {
            cardAction(pendingCard.playerIndex, pendingCard.cardId, pendingCard.action, payload)
            setPendingCard(null)
          }}
          onCancel={() => setPendingCard(null)}
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
