import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  children: ReactNode
  // React 19 では ref を通常の prop として受け取れる
  ref?: Ref<HTMLButtonElement>
}

const STYLES = {
  primary:
    'bg-pastel-pink-deep text-white shadow-[0_6px_0_#e07aa8] hover:brightness-105 active:shadow-[0_2px_0_#e07aa8] active:translate-y-1',
  secondary:
    'bg-pastel-mint text-choco shadow-[0_6px_0_#8fd9bd] hover:brightness-105 active:shadow-[0_2px_0_#8fd9bd] active:translate-y-1',
}

export default function KawaiiButton({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`min-h-16 px-5 rounded-full text-lg sm:text-xl font-bold whitespace-nowrap transition-all duration-100 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 ${STYLES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
