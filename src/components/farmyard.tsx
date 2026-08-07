import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { COLS, ROWS, edgesOfSpace, toIndex } from '@/game/geometry'
import { pastureInfo } from '@/game/farm'
import { cn } from '@/lib/utils'
import type { Player } from '@/game/types'

type FarmyardProps = {
  player: Player
  /** Spaces the player may currently act on, highlighted for selection. */
  selectable?: number[]
  selected?: number[]
  onSelectSpace?: (index: number) => void
  /** Fence edges available to build, and those staged for building. */
  selectableFences?: string[]
  stagedFences?: string[]
  onToggleFence?: (edge: string) => void
  className?: string
}

/**
 * The 3x5 farmyard. Spaces are grid cells; fences are absolutely positioned on
 * the edges between them, so a fence visibly belongs to two neighbouring
 * spaces exactly as it does on the physical board.
 */
export function Farmyard({
  player,
  selectable = [],
  selected = [],
  onSelectSpace,
  selectableFences = [],
  stagedFences = [],
  onToggleFence,
  className,
}: FarmyardProps) {
  const { t } = useTranslation()
  const built = useMemo(() => new Set(player.fences), [player.fences])
  const selectableSet = useMemo(() => new Set(selectable), [selectable])
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const fenceOptions = useMemo(() => new Set(selectableFences), [selectableFences])
  const staged = useMemo(() => new Set(stagedFences), [stagedFences])

  const pastureBySpace = useMemo(() => {
    const map = new Map<number, { key: string; capacity: number }>()
    for (const pasture of pastureInfo(player)) {
      for (const index of pasture.spaces) map.set(index, pasture)
    }
    return map
  }, [player])

  const animalsByKey = useMemo(
    () => new Map(player.animalPlacement.map((placement) => [placement.key, placement])),
    [player.animalPlacement],
  )

  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const space = player.farm[index]
          const pasture = pastureBySpace.get(index)
          const animals = pasture ? animalsByKey.get(pasture.key) : undefined
          const isSelectable = selectableSet.has(index)
          const isSelected = selectedSet.has(index)

          return (
            <button
              key={index}
              disabled={!isSelectable}
              onClick={() => onSelectSpace?.(index)}
              aria-label={t('farm.space', {
                number: index + 1,
                contents: space.kind === 'empty' ? t('farm.empty') : t(`farm.${space.kind}`),
              })}
              className={cn(
                'relative aspect-square rounded-sm border-2 border-transparent',
                'flex flex-col items-center justify-center gap-0.5 text-center',
                'text-[10px] leading-tight font-semibold transition-shadow',
                space.kind === 'empty' && !pasture && 'bg-muted',
                pasture && 'bg-pasture',
                space.kind === 'room' && houseClass(player.house),
                space.kind === 'field' && 'bg-field text-white',
                space.kind === 'stable' && 'bg-pasture ring-2 ring-inset ring-wood',
                isSelectable && 'cursor-pointer border-primary/70 hover:border-primary',
                isSelected && 'border-primary ring-2 ring-primary',
              )}
            >
              <span aria-hidden className="text-lg">
                {spaceIcon(player, index)}
              </span>
              {space.kind === 'field' && space.crop ? (
                <span>
                  {t('farm.cropCount', {
                    crop: t(`goods.${space.crop}`),
                    count: space.cropCount ?? 0,
                  })}
                </span>
              ) : (
                <span className="opacity-80">
                  {space.kind === 'empty' ? '' : t(`farm.${space.kind}`)}
                </span>
              )}
              {animals && animals.count > 0 && pasture?.key && (
                <span className="absolute right-0.5 bottom-0.5 rounded-sm bg-card/85 px-1 text-[9px]">
                  {animalIcon(animals.type)}×{animals.count}
                </span>
              )}
            </button>
          )
        })}

        {/* Fences sit on top of the grid, aligned to the edges between spaces. */}
        <FenceLayer
          built={built}
          options={fenceOptions}
          staged={staged}
          onToggle={onToggleFence}
        />
      </div>
    </div>
  )
}

function houseClass(house: Player['house']): string {
  if (house === 'stone') return 'bg-stone text-white'
  if (house === 'clay') return 'bg-clay text-white'
  return 'bg-wood text-white'
}

function spaceIcon(player: Player, index: number): string {
  const space = player.farm[index]
  switch (space.kind) {
    case 'room':
      return player.house === 'stone' ? '🏛️' : player.house === 'clay' ? '🧱' : '🏠'
    case 'field':
      return space.crop === 'vegetable' ? '🥕' : space.crop === 'grain' ? '🌾' : '🟫'
    case 'stable':
      return '🐴'
    default:
      return ''
  }
}

function animalIcon(type: 'sheep' | 'boar' | 'cattle'): string {
  return type === 'sheep' ? '🐑' : type === 'boar' ? '🐗' : '🐄'
}

type FenceLayerProps = {
  built: Set<string>
  options: Set<string>
  staged: Set<string>
  onToggle?: (edge: string) => void
}

/**
 * Renders every fence slot as a thin hit target positioned over the gap
 * between two spaces. Only built, staged, or currently-buildable slots are
 * visible, so the board stays legible when no fencing action is in progress.
 */
function FenceLayer({ built, options, staged, onToggle }: FenceLayerProps) {
  const { t } = useTranslation()
  const slots: { edge: string; style: React.CSSProperties; horizontal: boolean }[] = []

  for (let row = 0; row <= ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      slots.push({
        edge: edgesOfSpace(toIndex(Math.min(row, ROWS - 1), col))[row === ROWS ? 'bottom' : 'top'],
        horizontal: true,
        style: {
          left: `${(col / COLS) * 100}%`,
          width: `${(1 / COLS) * 100}%`,
          top: `${(row / ROWS) * 100}%`,
        },
      })
    }
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS; col++) {
      slots.push({
        edge: edgesOfSpace(toIndex(row, Math.min(col, COLS - 1)))[col === COLS ? 'right' : 'left'],
        horizontal: false,
        style: {
          top: `${(row / ROWS) * 100}%`,
          height: `${(1 / ROWS) * 100}%`,
          left: `${(col / COLS) * 100}%`,
        },
      })
    }
  }

  return (
    <>
      {slots.map(({ edge, style, horizontal }) => {
        const isBuilt = built.has(edge)
        const isStaged = staged.has(edge)
        const isOption = options.has(edge) && !isBuilt

        if (!isBuilt && !isStaged && !isOption) return null

        return (
          <button
            key={`${edge}-${horizontal ? 'h' : 'v'}`}
            aria-label={t(isBuilt ? 'farm.fenceBuilt' : 'farm.fence', { edge })}
            disabled={!isOption || !onToggle}
            onClick={() => onToggle?.(edge)}
            style={style}
            className={cn(
              'absolute z-10 rounded-full transition-colors',
              horizontal ? 'h-1.5 -translate-y-1/2' : 'w-1.5 -translate-x-1/2',
              isBuilt && 'bg-wood',
              isStaged && 'bg-primary',
              !isBuilt && !isStaged && 'bg-primary/25 hover:bg-primary/60 cursor-pointer',
            )}
          />
        )
      })}
    </>
  )
}
