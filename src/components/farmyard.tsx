import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { COLS, ROWS, edgesOfSpace, toIndex } from '@/game/geometry'
import { pastureInfo } from '@/game/farm'
import { cn } from '@/lib/utils'
import { GoodIcon, HouseIcon, StableIcon } from '@/components/ui/icons'
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
 *
 * Every space is drawn as its material — furrowed soil, tufted pasture, courses
 * of clay or stone — rather than as a flat swatch of colour. On a board this
 * small the texture is what makes a field readable as a field at a glance,
 * without having to read the label under it.
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
    const map = new Map<number, { key: string; capacity: number; spaces: number[] }>()
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
      {/* The frame is the ground the farm sits on: the gaps between spaces read
          as bare earth paths rather than as the page showing through. */}
      <div className="tile-fallow rounded-lg p-1 shadow-[inset_0_1px_3px_var(--shade)]">
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
            const isPastureLike = Boolean(pasture) || space.kind === 'stable'

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
                  'group relative aspect-square overflow-hidden rounded-md',
                  'flex flex-col items-center justify-center gap-0.5 text-center',
                  'text-[10px] leading-tight font-semibold',
                  'shadow-[var(--shadow-tile)] ring-1 ring-[var(--tile-edge)]',
                  'transition-[transform,box-shadow,outline-color]',
                  'outline-2 outline-offset-[-2px] outline-transparent',
                  space.kind === 'empty' && !isPastureLike && 'tile-fallow',
                  isPastureLike && 'tile-pasture text-[var(--ink)]',
                  space.kind === 'room' && cn(houseClass(player.house), 'tile-thatch'),
                  space.kind === 'field' && 'tile-field text-white',
                  isSelectable && 'cursor-pointer outline-primary/60 hover:outline-primary',
                  isSelectable && 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]',
                  isSelected &&
                    'outline-primary shadow-[var(--shadow-raised),0_0_0_3px_color-mix(in_oklab,var(--color-primary)_35%,transparent)]',
                )}
              >
                {/* Stables are a wooden frame standing on pasture, so the
                    timber hatch overlays the grass instead of replacing it. */}
                {space.kind === 'stable' && (
                  <span aria-hidden className="tile-stable absolute inset-0 opacity-45" />
                )}

                <SpaceGlyph player={player} index={index} />

                {space.kind === 'field' && space.crop ? (
                  <CropCount crop={space.crop} count={space.cropCount ?? 0} />
                ) : (
                  // Labels sit on tinted materials, so they carry their own
                  // shadow rather than relying on the tile staying pale.
                  <span className="relative [text-shadow:0_1px_1px_var(--shade-strong)]">
                    {space.kind === 'empty' ? '' : t(`farm.${space.kind}`)}
                  </span>
                )}

                {/* A herd lives in a pasture, not in each of its spaces. The
                    chip used to repeat on all four squares of a 2x2 pasture,
                    which read as four separate herds. */}
                {animals && animals.count > 0 && index === Math.min(...(pasture?.spaces ?? [])) && (
                  <span
                    className={cn(
                      'absolute right-0.5 bottom-0.5 flex items-center gap-0.5 rounded-full',
                      'bg-card px-1 py-px text-[10px] font-bold ring-1 ring-border',
                      'shadow-[var(--shadow-tile)]',
                    )}
                  >
                    <GoodIcon
                      good={animals.type}
                      className={cn('size-3', animalColour(animals.type))}
                    />
                    <span className="text-card-foreground tabular-nums">×{animals.count}</span>
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
    </div>
  )
}

function houseClass(house: Player['house']): string {
  if (house === 'stone') return 'bg-stone text-white'
  if (house === 'clay') return 'bg-clay text-white'
  return 'bg-wood text-white'
}

function animalColour(type: 'sheep' | 'boar' | 'cattle'): string {
  return type === 'sheep' ? 'text-sheep' : type === 'boar' ? 'text-boar' : 'text-cattle'
}

/** The structure standing on a space, drawn at a size that survives a phone. */
function SpaceGlyph({ player, index }: { player: Player; index: number }) {
  const space = player.farm[index]

  if (space.kind === 'room') {
    return <HouseIcon className="relative size-4 drop-shadow-[0_1px_1px_var(--shade-strong)]" />
  }
  if (space.kind === 'stable') {
    return <StableIcon className="relative size-4 text-wood drop-shadow-[0_1px_1px_var(--shade)]" />
  }
  return null
}

/**
 * A sown field shows its crop as pips — one glyph per unit, the way the goods
 * actually sit on the card. Past four they stop being countable at a glance, so
 * the tile falls back to a single glyph and a number. Either way the localised
 * "grain ×3" stays in the accessibility tree.
 */
function CropCount({ crop, count }: { crop: 'grain' | 'vegetable'; count: number }) {
  const { t } = useTranslation()
  const label = t('farm.cropCount', { crop: t(`goods.${crop}`), count })

  // The crop's own colour, so a sown field is legible against the soil.
  const tint = crop === 'grain' ? 'text-grain' : 'text-vegetable'
  const shadow = 'drop-shadow-[0_1px_1px_var(--shade-strong)]'

  if (count > 4) {
    return (
      <span className="relative flex items-center gap-0.5">
        <GoodIcon good={crop} className={cn('size-4', tint, shadow)} />
        <span aria-hidden>×{count}</span>
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  return (
    <span className="relative flex items-center justify-center gap-px">
      {Array.from({ length: count }, (_, pip) => (
        <GoodIcon key={pip} good={crop} className={cn('size-4', tint, shadow)} />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
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
 *
 * Built rails are lit along one edge and shaded along the other, and the posts
 * where two rails meet are drawn on top, so a finished pasture looks like
 * joined fencing rather than four separate lines.
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

  // A post belongs at every corner where at least two built rails meet — that
  // is what a real fence looks like, and it hides the mitre where two rails
  // cross at right angles.
  const percent = (value: React.CSSProperties[keyof React.CSSProperties]) =>
    Number(String(value ?? '0').replace('%', ''))

  const posts = new Map<string, React.CSSProperties>()
  for (const { edge, style, horizontal } of slots) {
    if (!built.has(edge)) continue
    const start = percent(horizontal ? style.left : style.top)
    const span = percent(horizontal ? style.width : style.height)
    for (const position of [start, start + span]) {
      const x = horizontal ? position : percent(style.left)
      const y = horizontal ? percent(style.top) : position
      // Keyed by corner, so the two rails meeting there share one post.
      posts.set(`${x}|${y}`, { left: `${x}%`, top: `${y}%` })
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
              'absolute z-10 rounded-full transition-[background-color,height,width]',
              horizontal ? 'h-1.5 -translate-y-1/2' : 'w-1.5 -translate-x-1/2',
              isBuilt && cn('rail-wood', !horizontal && 'rail-wood-vertical'),
              isStaged && 'bg-primary shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-primary)_30%,transparent)]',
              !isBuilt &&
                !isStaged &&
                cn(
                  'cursor-pointer bg-primary/25 hover:bg-primary/70',
                  horizontal ? 'hover:h-2' : 'hover:w-2',
                ),
            )}
          />
        )
      })}

      {[...posts].map(([key, style]) => (
        <span
          key={key}
          aria-hidden
          style={style}
          className={cn(
            'absolute z-20 size-2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-wood',
            'shadow-[0_1px_2px_var(--shade),inset_0_1px_0_color-mix(in_oklab,white_35%,transparent)]',
          )}
        />
      ))}
    </>
  )
}
