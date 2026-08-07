import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Solid variants are lit from above and press down on click, so a tap on a
 * touch screen is acknowledged before the state change lands. Ghost stays flat
 * — it is used inline in dense panels where a raised edge is just noise.
 */
const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: cn(
    'bg-primary text-primary-foreground hover:bg-primary/90',
    'shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-panel)] active:shadow-[var(--shadow-tile)]',
  ),
  outline: cn(
    'border border-border bg-card hover:bg-accent hover:text-accent-foreground',
    'shadow-[var(--shadow-tile)] hover:border-primary/40 hover:shadow-[var(--shadow-raised)]',
  ),
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: cn(
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    'shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-panel)] active:shadow-[var(--shadow-tile)]',
  ),
}

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold',
        'transition-[color,background-color,border-color,box-shadow,transform] duration-150',
        'active:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
