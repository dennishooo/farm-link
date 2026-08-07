import { useMemo, useState } from 'react'
import { Farmyard } from '@/components/farmyard'
import { Button } from '@/components/ui/button'
import { allEdges } from '@/game/geometry'
import { legalPlacements } from '@/game/farm'
import { ROOM_COST, STABLE_COST_WOOD, FENCE_COST_WOOD } from '@/game/rules'
import type { ActionPayload } from '@/game/engine'
import type { ActionSpaceId, Player } from '@/game/types'
import { actionModeFor, spaceName, type ActionMode } from '@/lib/actions'

type ActionDialogProps = {
  spaceId: ActionSpaceId
  player: Player
  onConfirm: (payload: ActionPayload) => void
  onCancel: () => void
}

export function ActionDialog({ spaceId, player, onConfirm, onCancel }: ActionDialogProps) {
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

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  const roomCost = ROOM_COST[player.house]

  function selectableSpaces(): number[] {
    switch (mode) {
      case 'plow':
      case 'cultivate':
        return plowTargets
      case 'room':
        return roomTargets
      case 'stable':
        return stableTargets
      case 'sow':
        return sowTargets
      default:
        return []
    }
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
      ? fences.length > 0
      : mode === 'sow'
        ? sowPlan.length > 0
        : mode === 'cultivate'
          ? spaces.length > 0 || sowPlan.length > 0
          : mode === 'expansion'
            ? false
            : spaces.length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={spaceName(spaceId)}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center"
    >
      <div className="max-h-[88vh] w-full max-w-lg overflow-auto rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-bold">{spaceName(spaceId)}</h2>

        {mode === 'expansion' && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">What would you like to build?</p>
            <Button onClick={() => setMode('room')}>
              Build rooms ({roomCost.amount} {roomCost.resource} + {roomCost.reed} reed each)
            </Button>
            <Button variant="outline" onClick={() => setMode('stable')}>
              Build stables ({STABLE_COST_WOOD} wood each, {player.stablesRemaining} left)
            </Button>
          </div>
        )}

        {mode !== 'expansion' && mode !== 'none' && (
          <>
            <p className="mt-1 text-sm text-muted-foreground">{instructionFor(mode)}</p>
            <div className="mt-3">
              <Farmyard
                player={player}
                selectable={selectableSpaces()}
                selected={mode === 'sow' ? sowPlan.map((e) => e.spaceIndex) : spaces}
                onSelectSpace={handleSpace}
                selectableFences={mode === 'fence' ? fenceOptions : []}
                stagedFences={fences}
                onToggleFence={(edge) => setFences(toggle(fences, edge))}
              />
            </div>

            {mode === 'sow' && sowPlan.length > 0 && (
              <ul className="mt-2 text-xs text-muted-foreground">
                {sowPlan.map((entry) => (
                  <li key={entry.spaceIndex}>
                    Space {entry.spaceIndex + 1}: {entry.crop} — tap again to change
                  </li>
                ))}
              </ul>
            )}

            {mode === 'fence' && (
              <p className="mt-2 text-xs text-muted-foreground">
                {fences.length} fence(s) · {fences.length * FENCE_COST_WOOD} wood · you have{' '}
                {player.wood}
              </p>
            )}
          </>
        )}

        {mode === 'none' && (
          <p className="mt-2 text-sm text-muted-foreground">Confirm to take this action.</p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          {mode !== 'expansion' && (
            <Button
              className="flex-1"
              disabled={mode !== 'none' && !canConfirm}
              onClick={confirm}
            >
              Confirm
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function instructionFor(mode: ActionMode): string {
  switch (mode) {
    case 'plow':
      return 'Choose an empty space to plow. Fields must touch your existing fields.'
    case 'room':
      return 'Choose spaces for new rooms. Rooms must touch your house.'
    case 'stable':
      return 'Choose spaces for stables. Stables may go anywhere empty.'
    case 'fence':
      return 'Tap the edges between spaces to build fences. They must fully enclose a pasture.'
    case 'sow':
      return 'Tap a field to sow grain, again for vegetables, again to clear.'
    case 'cultivate':
      return 'Optionally plow one field, and/or sow your empty fields.'
    default:
      return ''
  }
}
