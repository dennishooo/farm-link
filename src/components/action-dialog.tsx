import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Farmyard } from '@/components/farmyard'
import { Button } from '@/components/ui/button'
import { allEdges, findPastures, pastureBoundaryEdges } from '@/game/geometry'
import { legalPlacements } from '@/game/farm'
import { cardById, discountFor } from '@/game/cards'
import { ROOM_COST, STABLE_COST_WOOD, FENCE_COST_WOOD } from '@/game/rules'
import type { ActionPayload } from '@/game/engine'
import type { TFunction } from 'i18next'
import type { ActionSpaceId, Player } from '@/game/types'
import { actionModeFor, selectableFor, spaceName, type ActionMode } from '@/lib/actions'

type ActionDialogProps = {
  spaceId: ActionSpaceId
  player: Player
  onConfirm: (payload: ActionPayload) => void
  onCancel: () => void
}

export function ActionDialog({ spaceId, player, onConfirm, onCancel }: ActionDialogProps) {
  const { t } = useTranslation()
  const initialMode = actionModeFor(spaceId)
  const [mode, setMode] = useState<ActionMode>(initialMode === 'expansion' ? 'expansion' : initialMode)
  const [spaces, setSpaces] = useState<number[]>([])
  const [fences, setFences] = useState<string[]>([])
  const [sowPlan, setSowPlan] = useState<{ spaceIndex: number; crop: 'grain' | 'vegetable' }[]>([])

  const plowTargets = useMemo(() => legalPlacements(player.farm, 'field'), [player.farm])
  const roomTargets = useMemo(() => legalPlacements(player.farm, 'room'), [player.farm])
  const stableTargets = useMemo(() => legalPlacements(player.farm, 'stable'), [player.farm])
  const sowTargets = useMemo(
    () =>
      player.farm.flatMap((space, index) =>
        space.kind === 'field' && !space.crop ? [index] : [],
      ),
    [player.farm],
  )
  const fenceOptions = useMemo(
    () => allEdges().filter((edge) => !player.fences.includes(edge)),
    [player.fences],
  )

  // Live feedback while staging: which of the chosen fences would enclose
  // nothing, and how many pastures the result would have.
  const { danglingFences, stagedPastures } = useMemo(() => {
    const proposed = [...player.fences, ...fences]
    const boundary = pastureBoundaryEdges(proposed)
    return {
      danglingFences: fences.filter((edge) => !boundary.has(edge)),
      stagedPastures: findPastures(proposed).length,
    }
  }, [player.fences, fences])

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  const roomCost = ROOM_COST[player.house]

  // Mirror the engine's discounted costs so the menu can say up front what is
  // affordable, rather than failing after a space has been chosen.
  const playedCards = useMemo(
    () => player.played.map(cardById).filter((card) => card !== undefined),
    [player.played],
  )
  const canAffordRoom =
    roomTargets.length > 0 &&
    player[roomCost.resource] >=
      Math.max(0, roomCost.amount - discountFor(playedCards, roomCost.resource, 'room')) &&
    player.reed >= Math.max(0, roomCost.reed - discountFor(playedCards, 'reed', 'room'))
  const canAffordStable =
    stableTargets.length > 0 &&
    player.stablesRemaining > 0 &&
    player.wood >= STABLE_COST_WOOD

  function selectableSpaces(): number[] {
    return selectableFor(mode, {
      plow: plowTargets,
      room: roomTargets,
      stable: stableTargets,
      sow: sowTargets,
    })
  }

  function handleSpace(index: number) {
    if (mode === 'sow') {
      const existing = sowPlan.find((entry) => entry.spaceIndex === index)
      if (!existing) {
        setSowPlan([...sowPlan, { spaceIndex: index, crop: 'grain' }])
      } else if (existing.crop === 'grain') {
        setSowPlan(sowPlan.map((e) => (e.spaceIndex === index ? { ...e, crop: 'vegetable' } : e)))
      } else {
        setSowPlan(sowPlan.filter((e) => e.spaceIndex !== index))
      }
      return
    }

    // In cultivate mode the same board serves both halves of the action, so
    // the space itself decides which: an existing field is sown, anything else
    // is plowed.
    if (mode === 'cultivate' && sowTargets.includes(index)) {
      const existing = sowPlan.find((entry) => entry.spaceIndex === index)
      if (!existing) {
        setSowPlan([...sowPlan, { spaceIndex: index, crop: 'grain' }])
      } else if (existing.crop === 'grain') {
        setSowPlan(sowPlan.map((e) => (e.spaceIndex === index ? { ...e, crop: 'vegetable' } : e)))
      } else {
        setSowPlan(sowPlan.filter((e) => e.spaceIndex !== index))
      }
      return
    }

    if (mode === 'plow' || mode === 'cultivate') {
      setSpaces(spaces[0] === index ? [] : [index])
      return
    }

    setSpaces(toggle(spaces, index))
  }

  function confirm() {
    switch (mode) {
      case 'plow':
        onConfirm({ spaceIndex: spaces[0] })
        return
      case 'room':
        onConfirm({ spaceIndices: spaces })
        return
      case 'stable':
        onConfirm({ spaceIndices: spaces, stables: true })
        return
      case 'fence':
        onConfirm({ fences })
        return
      case 'sow':
        onConfirm({ sow: sowPlan })
        return
      case 'cultivate':
        onConfirm({ spaceIndex: spaces[0], sow: sowPlan })
        return
      default:
        onConfirm({})
    }
  }

  const canConfirm =
    mode === 'fence'
      ? fences.length > 0 && danglingFences.length === 0
      : mode === 'sow'
        ? sowPlan.length > 0
        : mode === 'cultivate'
          ? spaces.length > 0 || sowPlan.length > 0
          : // Both pick their option from a button, so there is nothing left
            // for a footer Confirm to do.
            mode === 'expansion' || mode === 'resource'
            ? false
            : spaces.length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(`spaces.${spaceId}.name`, spaceName(spaceId))}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center"
    >
      <div className="max-h-[88vh] w-full max-w-lg overflow-auto rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-bold">{t(`spaces.${spaceId}.name`, spaceName(spaceId))}</h2>

        {mode === 'expansion' && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{t('dialog.whatToBuild')}</p>
            <Button disabled={!canAffordRoom} onClick={() => setMode('room')}>
              {t('dialog.buildRooms', {
                amount: roomCost.amount,
                resource: t(`goods.${roomCost.resource}`),
                reed: roomCost.reed,
              })}
            </Button>
            <Button
              variant="outline"
              disabled={!canAffordStable}
              onClick={() => setMode('stable')}
            >
              {t('dialog.buildStables', {
                cost: STABLE_COST_WOOD,
                remaining: player.stablesRemaining,
              })}
            </Button>
            {/* Cost was only checked on confirm, so an unaffordable build looked
                like the board simply refusing to respond. */}
            {(!canAffordRoom || !canAffordStable) && (
              <p className="text-xs text-destructive">{t('dialog.cannotAffordBuild')}</p>
            )}
          </div>
        )}

        {mode === 'resource' && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{t('dialog.chooseResource')}</p>
            {(['reed', 'stone'] as const).map((resource) => (
              <Button
                key={resource}
                variant={resource === 'reed' ? 'default' : 'outline'}
                onClick={() => onConfirm({ resource })}
              >
                {t('dialog.takeResourceAndFood', { resource: t(`goods.${resource}`) })}
              </Button>
            ))}
          </div>
        )}

        {mode !== 'expansion' && mode !== 'resource' && mode !== 'none' && (
          <>
            <p className="mt-1 text-sm text-muted-foreground">{instructionFor(mode, t)}</p>
            <div className="mt-3">
              <Farmyard
                player={player}
                selectable={selectableSpaces()}
                selected={
                  mode === 'sow'
                    ? sowPlan.map((e) => e.spaceIndex)
                    : mode === 'cultivate'
                      ? [...spaces, ...sowPlan.map((e) => e.spaceIndex)]
                      : spaces
                }
                onSelectSpace={handleSpace}
                selectableFences={mode === 'fence' ? fenceOptions : []}
                stagedFences={fences}
                onToggleFence={(edge) => setFences(toggle(fences, edge))}
              />
            </div>

            {(mode === 'sow' || mode === 'cultivate') && sowPlan.length > 0 && (
              <ul className="mt-2 text-xs text-muted-foreground">
                {sowPlan.map((entry) => (
                  <li key={entry.spaceIndex}>
                    {t('dialog.sowHint', {
                      number: entry.spaceIndex + 1,
                      crop: t(`goods.${entry.crop}`),
                    })}
                  </li>
                ))}
              </ul>
            )}

            {mode === 'fence' && (
              <>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('dialog.fenceCost', {
                    count: fences.length,
                    wood: fences.length * FENCE_COST_WOOD,
                    have: player.wood,
                  })}
                </p>
                {fences.length > 0 && danglingFences.length > 0 && (
                  <p className="mt-1 text-xs font-semibold text-destructive">
                    {t('dialog.fenceDangling', { count: danglingFences.length })}
                  </p>
                )}
                {fences.length > 0 && danglingFences.length === 0 && (
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {t('dialog.fencePastures', { count: stagedPastures })}
                  </p>
                )}
              </>
            )}
          </>
        )}

        {mode === 'none' && (
          <p className="mt-2 text-sm text-muted-foreground">{t('dialog.confirmAction')}</p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('dialog.cancel')}
          </Button>
          {mode !== 'expansion' && (
            <Button
              className="flex-1"
              disabled={mode !== 'none' && !canConfirm}
              onClick={confirm}
            >
              {t('dialog.confirm')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function instructionFor(mode: ActionMode, t: TFunction): string {
  switch (mode) {
    case 'plow':
    case 'room':
    case 'stable':
    case 'fence':
    case 'sow':
    case 'cultivate':
      return t(`dialog.instructions.${mode}`)
    default:
      return ''
  }
}
