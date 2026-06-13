import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-[var(--fg)] text-[var(--bg)] hover:opacity-80 focus-visible:ring-[var(--fg)]',
  ghost:
    'border border-[var(--border)] bg-transparent text-[var(--fg)] hover:border-[var(--fg)] hover:bg-[var(--bg-subtle)] focus-visible:ring-[var(--fg)]',
  outline:
    'border border-[var(--border)] bg-transparent text-[var(--grey)] hover:border-[var(--fg)] hover:text-[var(--fg)] focus-visible:ring-[var(--fg)]',
}

const sizes = {
  sm: 'px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm',
  md: 'px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
  lg: 'px-5 py-3 text-sm sm:px-8 sm:py-3.5 sm:text-base',
}

/**
 * Accessible button with responsive sizing. Renders as Link when `to` is provided.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to,
  href,
  type = 'button',
  disabled = false,
  ariaLabel,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center rounded-sm font-medium',
    'transition-opacity duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  )
}
