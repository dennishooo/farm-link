import { findSpace } from '@/game/engine'
import type { ActionSpaceId } from '@/game/types'

/** Which extra input, if any, an action space needs before it can resolve. */
export type ActionMode =
  | 'none'
  | 'plow'
  | 'room'
  | 'stable'
  | 'fence'
  | 'sow'
  | 'expansion'
  | 'cultivate'
  | 'card'
  | 'resource'

export function actionModeFor(spaceId: ActionSpaceId): ActionMode {
  switch (spaceId) {
    case 'lessons':
    case 'lessons-2':
    case 'major-improvement':
      return 'card'
    case 'farmland':
      return 'plow'
    case 'farm-expansion':
      return 'expansion'
    case 'fences':
      return 'fence'
    case 'grain-utilization':
      return 'sow'
    case 'sow-and-bake':
      return 'cultivate'
    case 'resource-market':
      return 'resource'
    default:
      return 'none'
  }
}

export function spaceName(id: ActionSpaceId): string {
  return findSpace(id)?.name ?? id
}

/**
 * Which farm spaces a mode lets the player choose.
 *
 * Cultivation is the interesting case: it is "plow a field and/or sow", so both
 * an empty space to plow and an existing field to sow must be selectable in one
 * dialog. Offering only the plow targets left the sow half unreachable.
 */
export function selectableFor(
  mode: ActionMode,
  targets: { plow: number[]; room: number[]; stable: number[]; sow: number[] },
): number[] {
  switch (mode) {
    case 'plow':
      return targets.plow
    case 'cultivate':
      return [...new Set([...targets.plow, ...targets.sow])]
    case 'room':
      return targets.room
    case 'stable':
      return targets.stable
    case 'sow':
      return targets.sow
    default:
      return []
  }
}
