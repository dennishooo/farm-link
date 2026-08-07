import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Hand-drawn glyphs for every material, animal and farm structure.
 *
 * These used to be emoji. Emoji are drawn by the platform, so the board looked
 * like a different game on every device — Apple's 🐑 is a photoreal sheep,
 * Noto's is a flat cartoon, and Windows renders 🪵 as a beige smudge at the
 * sizes we use. Worse, they carry their own colour, so a wood chip could not be
 * tinted with the wood token and nothing on the board matched anything else.
 *
 * Every glyph here is a silhouette in `currentColor`, with interior detail at
 * reduced opacity. Tint one with `text-wood` and the icon, its chip and the
 * fence rails all come from the same variable.
 */

type IconProps = Omit<ComponentProps<'svg'>, 'children'> & {
  /** Rendered at 1em by default so icons track the surrounding text size. */
  className?: string
}

function Glyph({ className, children, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn('size-[1em] shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  )
}

export function WoodIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M7 5.5h10.2a4.2 4.2 0 0 1 0 13H7a4.2 4.2 0 0 1 0-13Z" opacity={0.85} />
      <ellipse cx="7" cy="12" rx="4.2" ry="6.5" />
      <ellipse cx="7" cy="12" rx="2.4" ry="3.8" opacity={0.35} fill="var(--card)" />
      <ellipse cx="7" cy="12" rx="0.9" ry="1.5" opacity={0.5} fill="var(--card)" />
    </Glyph>
  )
}

export function ClayIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="2.5" y="5" width="19" height="5.6" rx="1.1" />
      <rect x="2.5" y="12.4" width="19" height="5.6" rx="1.1" opacity={0.85} />
      <rect x="11.4" y="5" width="1.2" height="5.6" opacity={0.45} fill="var(--card)" />
      <rect x="6.6" y="12.4" width="1.2" height="5.6" opacity={0.45} fill="var(--card)" />
      <rect x="16.2" y="12.4" width="1.2" height="5.6" opacity={0.45} fill="var(--card)" />
    </Glyph>
  )
}

export function ReedIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M11.3 21V9.5h1.4V21h-1.4Z" />
      <rect x="10.2" y="2.6" width="3.6" height="8" rx="1.8" opacity={0.9} />
      <path d="M6.2 21c-.2-4.6.9-7.6 3.3-9.1.5 3.9-.5 6.9-3.3 9.1Z" opacity={0.7} />
      <path d="M17.8 21c.2-4.6-.9-7.6-3.3-9.1-.5 3.9.5 6.9 3.3 9.1Z" opacity={0.7} />
    </Glyph>
  )
}

export function StoneIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12.6 10.4 17 7.2l4.6 3.1.9 5.6-4.8 3.4-5.2-2.3-.8-4.9Z" opacity={0.65} />
      <path d="M2 13.1 6.8 8.6l5.5 2.6 1.3 5.4-4.4 4-5.6-2.4L2 13.1Z" />
      <path d="m6.8 8.6 1.4 4.9 4.1-2.3-5.5-2.6Z" opacity={0.4} fill="var(--card)" />
    </Glyph>
  )
}

export function GrainIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      {/* Fat kernels rather than fine ears: at 14px on a farmyard tile a
          slender wheat stalk collapsed into an unreadable scribble. */}
      <path d="M11.2 22V12h1.6v10h-1.6Z" opacity={0.9} />
      <ellipse cx="12" cy="5" rx="2.3" ry="3.4" />
      <ellipse cx="8.3" cy="9.6" rx="2.1" ry="3.2" transform="rotate(-34 8.3 9.6)" />
      <ellipse cx="15.7" cy="9.6" rx="2.1" ry="3.2" transform="rotate(34 15.7 9.6)" />
      <ellipse cx="8.3" cy="15" rx="2.1" ry="3.2" transform="rotate(-34 8.3 15)" opacity={0.85} />
      <ellipse cx="15.7" cy="15" rx="2.1" ry="3.2" transform="rotate(34 15.7 15)" opacity={0.85} />
    </Glyph>
  )
}

export function VegetableIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 8.4c3 0 5 1.7 5 4.2 0 3.4-2.6 8.9-5 8.9s-5-5.5-5-8.9c0-2.5 2-4.2 5-4.2Z" />
      <path d="M11.4 8V4.6h1.2V8h-1.2Z" opacity={0.9} />
      <path d="M11.6 5.4C10.3 4.4 8.6 4.2 6.6 4.8c1 1.8 2.6 2.6 5 2.4V5.4ZM12.4 5.4c1.3-1 3-1.2 5-.6-1 1.8-2.6 2.6-5 2.4V5.4Z" opacity={0.75} />
      <path d="M10.1 12.6c.9.5 1.4 1.4 1.5 2.7-1.1-.4-1.6-1.3-1.5-2.7ZM13.4 15.6c.7.4 1.1 1.1 1.2 2.1-.9-.3-1.3-1-1.2-2.1Z" opacity={0.4} fill="var(--card)" />
    </Glyph>
  )
}

export function FoodIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.6 11h18.8c0 4.4-2.9 7.6-7 8.4V21H9.6v-1.6c-4.1-.8-7-4-7-8.4Z" />
      <path d="M2 10h20a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2Z" opacity={0.9} />
      <path d="M8.4 8.4c-1.4-1.3-1.4-2.6 0-3.9.7.7.9 1.3.6 1.9 1.2 1 1.4 1.9.6 2.7-.3-.4-.7-.6-1.2-.7ZM14.4 8.4c-1.4-1.3-1.4-2.6 0-3.9.7.7.9 1.3.6 1.9 1.2 1 1.4 1.9.6 2.7-.3-.4-.7-.6-1.2-.7Z" opacity={0.55} />
    </Glyph>
  )
}

export function SheepIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M8 17.6h1.6v3H8v-3ZM13 17.6h1.6v3H13v-3Z" opacity={0.8} />
      <path d="M8.6 7.4c1-1.6 5-1.8 6.3 0 2.4-.5 4 .8 4 2.8 0 1-.4 1.8-1.1 2.3.4 2.6-1.4 4.4-5.4 4.4S6 15.1 6.4 12.5c-.7-.5-1.1-1.3-1.1-2.3 0-2 1.6-3.3 3.3-2.8Z" />
      <path d="M16.6 6.4c1.9 0 3.2 1.2 3.2 3 0 1.7-1.3 2.9-3.2 2.9-1.9 0-3.2-1.2-3.2-2.9 0-1.8 1.3-3 3.2-3Z" opacity={0.55} />
      <path d="M20 8.2c1 0 1.6.7 1.6 1.7 0 1.4-1.1 2.3-2.2 1.7.4-1 .5-2.2.6-3.4Z" opacity={0.4} />
    </Glyph>
  )
}

export function BoarIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M7.4 17.4H9v3.2H7.4v-3.2ZM13.4 17.4H15v3.2h-1.6v-3.2Z" opacity={0.8} />
      <path d="M4 12.2c0-3 2.8-5 7-5 2.5 0 4.4.6 5.7 1.7l3.6-.6-1 2.5 1.5 1.4-2.2.9c-.2 3-2.8 4.8-7.6 4.8-4.2 0-7-2-7-5.7Z" />
      <path d="M17.6 12.6c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Z" opacity={0.45} fill="var(--card)" />
      <path d="M8.6 4.6c.5 1 .7 1.9.6 2.8l-1.7.4c-.1-1.2.3-2.2 1.1-3.2ZM12 4c.8.9 1.2 1.7 1.3 2.6l-1.7-.1c-.2-.9 0-1.7.4-2.5Z" opacity={0.65} />
    </Glyph>
  )
}

export function CattleIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M6.6 16.8h1.7v3.8H6.6v-3.8ZM14.4 16.8h1.7v3.8h-1.7v-3.8Z" opacity={0.8} />
      <path d="M4.4 10.4c0-1.9 1.6-2.9 4-2.9h6.4c2.4 0 4 1 4 2.9v2.4c0 2.9-2.2 4.4-7.2 4.4s-7.2-1.5-7.2-4.4v-2.4Z" />
      <path d="M9.6 2.8c1.3.6 2 1.7 2 3.3l-1.8.5c-.8-1.3-.9-2.6-.2-3.8ZM14.4 2.8c.7 1.2.6 2.5-.2 3.8l-1.8-.5c0-1.6.7-2.7 2-3.3Z" opacity={0.7} />
      <path d="M8.6 12.6h6.8v1.5a1 1 0 0 1-1 1h-4.8a1 1 0 0 1-1-1v-1.5Z" opacity={0.4} fill="var(--card)" />
    </Glyph>
  )
}

export function HouseIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 2.6 22.4 11l-1.3 1.6L12 5.3 2.9 12.6 1.6 11 12 2.6Z" />
      <path d="M4.6 11.6 12 5.8l7.4 5.8v9.4H4.6v-9.4Z" opacity={0.85} />
      <path d="M9.9 14h4.2v7.2H9.9V14Z" opacity={0.45} fill="var(--card)" />
    </Glyph>
  )
}

export function FieldIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2 8.4c3.2-1.6 6.6-2.4 10-2.4s6.8.8 10 2.4v9.2c-3.2-1.6-6.6-2.4-10-2.4s-6.8.8-10 2.4V8.4Z" />
      <path d="M2 11.2c3.2-1.6 6.6-2.4 10-2.4s6.8.8 10 2.4v1.2c-3.2-1.6-6.6-2.4-10-2.4s-6.8.8-10 2.4v-1.2ZM2 14.2c3.2-1.6 6.6-2.4 10-2.4s6.8.8 10 2.4v1.2c-3.2-1.6-6.6-2.4-10-2.4s-6.8.8-10 2.4v-1.2Z"
        opacity={0.45}
        fill="var(--card)"
      />
    </Glyph>
  )
}

export function StableIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 2.4 21.6 7v14h-3.4V9.6H5.8V21H2.4V7L12 2.4Z" />
      <path d="M7.4 11.2h9.2V21H7.4v-9.8Z" opacity={0.55} />
      <path d="M8.9 12.7h6.2v3.1H8.9v-3.1Z" opacity={0.45} fill="var(--card)" />
    </Glyph>
  )
}

export function FenceIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M5 5.6 7 3.6l2 2V21H5V5.6ZM15 5.6l2-2 2 2V21h-4V5.6Z" />
      <path d="M2 8.6h20v2.4H2V8.6ZM2 14h20v2.4H2V14Z" opacity={0.75} />
    </Glyph>
  )
}

export function PersonIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="6.4" r="4" />
      <path d="M12 11.6c4.2 0 6.8 2.6 6.8 6.6v3H5.2v-3c0-4 2.6-6.6 6.8-6.6Z" opacity={0.85} />
    </Glyph>
  )
}

/** Every good the interface has to draw, keyed the way the game state names it. */
const GOOD_ICON = {
  wood: WoodIcon,
  clay: ClayIcon,
  reed: ReedIcon,
  stone: StoneIcon,
  grain: GrainIcon,
  vegetable: VegetableIcon,
  food: FoodIcon,
  sheep: SheepIcon,
  boar: BoarIcon,
  cattle: CattleIcon,
} as const

export type GoodIconName = keyof typeof GOOD_ICON

/**
 * Draw any good by name. Used where the good is only known at runtime — the
 * action spaces, the accumulation chips and the animal slots. An unknown good
 * draws nothing rather than throwing: the card data is generated, and a new
 * good appearing there should not take the board down.
 */
export function GoodIcon({ good, className }: { good: string; className?: string }) {
  if (!(good in GOOD_ICON)) return null
  const Component = GOOD_ICON[good as GoodIconName]
  return <Component className={className} />
}
