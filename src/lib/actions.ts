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

export function actionModeFor(spaceId: ActionSpaceId): ActionMode {
  switch (spaceId) {
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
    default:
      return 'none'
  }
}

export function spaceName(id: ActionSpaceId): string {
  return findSpace(id)?.name ?? id
}
