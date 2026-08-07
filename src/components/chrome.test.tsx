import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'
import { AppFooter } from './app-footer'
import { Farmyard } from './farmyard'
import { renderUI, testPlayer } from './test-utils'
import i18n from '@/lib/i18n'

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('LanguageSwitcher', () => {
  it('switches the interface language', async () => {
    const user = userEvent.setup()
    await renderUI(<LanguageSwitcher />)

    await user.selectOptions(screen.getByLabelText('Language'), 'zh-HK')
    expect(i18n.resolvedLanguage).toBe('zh-HK')

    await i18n.changeLanguage('en')
  })

  it('shows the active language as selected', async () => {
    await renderUI(<LanguageSwitcher />)
    expect(screen.getByLabelText<HTMLSelectElement>('Language').value).toBe('en')
  })

  it('matches a regional variant onto its base language', async () => {
    // Regression: zh-TW once fell through to English because only exact codes
    // were matched. renderUI forces English, so switch after mounting.
    const user = userEvent.setup()
    await renderUI(<LanguageSwitcher />)
    await i18n.changeLanguage('zh-TW')

    await user.click(document.body) // let the re-render settle
    expect(screen.getByLabelText<HTMLSelectElement>('語言').value).toBe('zh-HK')

    await i18n.changeLanguage('en')
  })
})

describe('ThemeToggle', () => {
  it('turns the dark theme on and off', async () => {
    const user = userEvent.setup()
    await renderUI(<ThemeToggle />)

    await user.click(screen.getByLabelText('Switch to dark theme'))
    expect(document.documentElement).toHaveClass('dark')

    await user.click(screen.getByLabelText('Switch to light theme'))
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('remembers the choice for the next session', async () => {
    const user = userEvent.setup()
    await renderUI(<ThemeToggle />)

    await user.click(screen.getByLabelText('Switch to dark theme'))
    expect(localStorage.getItem('farmlink-theme')).toBe('dark')
  })
})

describe('AppFooter', () => {
  it('links the version to the changelog', async () => {
    await renderUI(<AppFooter />)
    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('href', expect.stringContaining('CHANGELOG.md'))
    expect(link).toHaveTextContent(/^v/)
  })
})

describe('Farmyard', () => {
  it('labels every space with its contents', async () => {
    await renderUI(<Farmyard player={testPlayer()} />)

    // Two starting rooms, thirteen empty spaces.
    expect(screen.getAllByRole('button', { name: /: Room$/ })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /: empty$/ })).toHaveLength(13)
  })

  it('disables every space when none is selectable', async () => {
    await renderUI(<Farmyard player={testPlayer()} />)
    expect(screen.getByRole('button', { name: 'Space 1: empty' })).toBeDisabled()
  })

  it('enables only the spaces offered', async () => {
    await renderUI(<Farmyard player={testPlayer()} selectable={[0, 2]} />)

    expect(screen.getByRole('button', { name: 'Space 1: empty' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Space 2: empty' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Space 3: empty' })).toBeEnabled()
  })

  it('shows a sown field with its crop count', async () => {
    const player = testPlayer()
    player.farm[0] = { kind: 'field', crop: 'grain', cropCount: 3 }
    await renderUI(<Farmyard player={player} />)

    expect(screen.getByRole('button', { name: 'Space 1: Field' })).toHaveTextContent('×3')
  })
})
