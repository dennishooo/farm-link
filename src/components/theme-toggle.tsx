import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredTheme, resolveTheme, setStoredTheme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => resolveTheme(getStoredTheme()))

  useEffect(() => {
    setStoredTheme(theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  )
}
