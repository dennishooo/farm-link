import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { availableConversions, cardById } from '@/game/cards'
import { localiseCard } from '@/lib/i18n/format'
import type { Player } from '@/game/types'
import type { Payable } from '@/game/cards/types'

type ConvertPanelProps = {
  player: Player
  playerIndex: number
  onConvert: (playerIndex: number, cardId: string, units: number, good: Payable) => void
}

/**
 * "Bake bread" and the cooking improvements are anytime actions in Agricola,
 * so they live outside the worker-placement flow.
 */
export function ConvertPanel({ player, playerIndex, onConvert }: ConvertPanelProps) {
  const { t, i18n } = useTranslation()

  const cards = player.played.map(cardById).filter((card) => card !== undefined)
  const conversions = availableConversions(cards)
  if (conversions.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 border-t border-border pt-2">
      <p className="text-[11px] font-bold text-muted-foreground">{t('cards.exchanges')}</p>
      <ul className="flex flex-wrap gap-1.5">
        {conversions.map((conversion) => {
          const card = cardById(conversion.cardId)!
          const localised = localiseCard(card, i18n.language)
          const affordable = player[conversion.from] > 0

          return (
            <li key={conversion.cardId}>
              <Button
                size="sm"
                variant="outline"
                disabled={!affordable}
                onClick={() => onConvert(playerIndex, conversion.cardId, 1, conversion.from)}
                title={localised.title}
                className="h-7 text-[11px]"
              >
                {t('cards.exchange', {
                  from: t(`goods.${conversion.from}` as 'goods.wood'),
                  count: conversion.rate,
                })}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
