import Container from './Container'

/**
 * Semantic section with optional heading and responsive vertical rhythm.
 */
export default function Section({
  id,
  title,
  subtitle,
  eyebrow,
  children,
  className = '',
  containerClassName = '',
  as: Tag = 'section',
  ariaLabel,
}) {
  return (
    <Tag
      id={id}
      className={`py-section-y ${className}`}
      aria-label={ariaLabel || (title ? undefined : undefined)}
    >
      <Container className={containerClassName}>
        {(eyebrow || title || subtitle) && (
          <header className="mb-6 sm:mb-8 md:mb-10">
            {eyebrow && (
              <p className="mb-2 text-fluid-xs font-medium uppercase tracking-[0.12em] text-[var(--grey)]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif text-fluid-xl font-normal tracking-tight text-[var(--fg)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 max-w-2xl text-fluid-sm font-light leading-relaxed text-[var(--grey)]">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </Tag>
  )
}
