/**
 * Responsive max-width wrapper with fluid horizontal padding.
 */
export default function Container({
  as: Tag = 'div',
  children,
  className = '',
  narrow = false,
  ...props
}) {
  const maxWidth = narrow ? 'max-w-3xl' : 'max-w-container'
  return (
    <Tag
      className={[
        'mx-auto w-full',
        maxWidth,
        'px-4 xs:px-5 sm:px-6 md:px-8 lg:px-[5%]',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
