import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { housingSlots, type HousingSlot } from '@/game/farm'
import { GoodIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { Player } from '@/game/types'

const ANIMAL_TINT: Record<string, string> = {
  sheep: 'text-sheep',
  boar: 'text-boar',
  cattle: 'text-cattle',
}

type AnimalPanelProps = {
  player: Player
  playerIndex: number
  onMove: (playerIndex: number, fromKey: string, toKey: string, count: number) => void
}

/**
 * Moving animals is an anytime action in Agricola, and without it the greedy
 * automatic placement can strand capacity — a single sheep in its own pasture
 * blocks that whole pasture from holding anything else.
 *
 * Tap a slot holding animals to pick it up, then tap a destination.
 */
export function AnimalPanel({ player, playerIndex, onMove }: AnimalPanelProps) {
  const { t } = useTranslation()
  const [fromKey, setFromKey] = useState<string | null>(null)

  const slots = useMemo(() => housingSlots(player), [player])
  const hasAnimals = slots.some((slot) => slot.count > 0)
  // Only worth showing once there is somewhere to move animals between.
  if (!hasAnimals || slots.length < 2) return null

  const source = slots.find((slot) => slot.key === fromKey) ?? null

  function canReceive(slot: HousingSlot): boolean {
    if (!source || slot.key === source.key) return false
    if (slot.type && slot.type !== source.type) return false
    return slot.count < slot.capacity
  }

  function handleSlot(slot: HousingSlot) {
    if (!source) {
      if (slot.count > 0) setFromKey(slot.key)
      return
    }
    if (slot.key === source.key) {
      setFromKey(null)
      return
    }
    if (canReceive(slot)) {
      onMove(playerIndex, source.key, slot.key, 1)
      setFromKey(null)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 border-t border-border pt-2">
      <p className="text-[11px] font-bold text-muted-foreground">
        {source ? t('animals.chooseTarget') : t('animals.title')}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {slots.map((slot) => {
          const isSource = slot.key === source?.key
          const isTarget = canReceive(slot)
          const selectable = source ? isTarget || isSource : slot.count > 0

          return (
            <li key={slot.key}>
              <Button
                size="sm"
                variant={isSource ? 'default' : 'outline'}
                disabled={!selectable}
                onClick={() => handleSlot(slot)}
                className={cn('h-7 gap-1 text-[11px]', isTarget && 'border-primary')}
              >
                <SlotLabel slot={slot} />
              </Button>
            </li>
          )
        })}
      </ul>
      {source && (
        <button
          onClick={() => setFromKey(null)}
          className="self-start text-[11px] text-muted-foreground underline"
        >
          {t('dialog.cancel')}
        </button>
      )}
    </div>
  )
}

function SlotLabel({ slot }: { slot: HousingSlot }) {
  const { t } = useTranslation()

  const where =
    slot.kind === 'pet'
      ? t('animals.house')
      : slot.kind === 'stable'
        ? t('farm.stable')
        : t('animals.pastureAt', { spaces: slot.spaces.map((i) => i + 1).join(',') })

  return (
    <>
      {where}{' '}
      {slot.type ? (
        <span className="flex items-center gap-0.5">
          <GoodIcon good={slot.type} className={cn('size-3.5', ANIMAL_TINT[slot.type])} />
          <span className="tabular-nums">
            {slot.count}/{slot.capacity}
          </span>
        </span>
      ) : (
        t('animals.emptySlot', { capacity: slot.capacity })
      )}
    </>
  )
}
