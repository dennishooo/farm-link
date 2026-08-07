/**
 * Shared setup for component tests.
 *
 * Components read every string through react-i18next, so tests render inside a
 * real initialised instance rather than a mock: a wrong or missing key then
 * shows up as a failing assertion instead of passing silently.
 */

import { render, type RenderOptions } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import { createGame } from '@/game/engine'
import { horizontalEdge, verticalEdge } from '@/game/geometry'
import type { GameState, Player } from '@/game/types'
import type { ReactElement } from 'react'

/** A deterministic game, so revealed stage cards never flake a test. */
export function testGame(names = ['Ann', 'Bo']): GameState {
  return createGame({ names, random: () => 0.42 })
}

export function testPlayer(): Player {
  return testGame(['Ann']).players[0]
}

/** The fence edges enclosing a rectangle of spaces, inclusive. */
export function fenceRect(row0: number, col0: number, row1: number, col1: number): string[] {
  const edges: string[] = []
  for (let col = col0; col <= col1; col++) {
    edges.push(horizontalEdge(row0, col), horizontalEdge(row1 + 1, col))
  }
  for (let row = row0; row <= row1; row++) {
    edges.push(verticalEdge(row, col0), verticalEdge(row, col1 + 1))
  }
  return edges
}

/** Render in English unless a test switches language itself. */
export async function renderUI(ui: ReactElement, options?: RenderOptions) {
  await i18n.changeLanguage('en')
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>, options)
}

/** Render with the interface in Traditional Chinese. */
export async function renderInChinese(ui: ReactElement, options?: RenderOptions) {
  await i18n.changeLanguage('zh-HK')
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>, options)
}
