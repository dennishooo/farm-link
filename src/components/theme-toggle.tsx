import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredTheme, resolveTheme, setStoredTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState(() => resolveTheme(getStoredTheme()))

  useEffect(() => {
    setStoredTheme(theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  )
}
