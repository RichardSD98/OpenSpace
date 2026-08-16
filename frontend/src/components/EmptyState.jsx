import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

/**
 * The single empty state used everywhere a collection can come back with
 * nothing in it.
 *
 * Every empty state answers three questions in the same order: what would
 * normally be here (icon + title), why it is not (description), and what to do
 * next (action). Pages that skip the third question leave the reader stuck, so
 * an action is supplied wherever one genuinely exists.
 *
 *   <EmptyState
 *     icon={Home}
 *     title="No listings yet"
 *     description="The first listing posted will show up here."
 *     action={{ to: '/post-listing', label: 'Post a listing' }}
 *   />
 *
 * `action` and `secondaryAction` take either `to` (router link) or `onClick`
 * (button). `tone="bare"` drops the border for places that already sit inside
 * a bordered container.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'boxed',
}) {
  return (
    // role="status" so a screen reader hears the result of a search that
    // returned nothing — without it the page simply goes quiet after loading.
    <div className={`empty-state empty-state-${tone}`} role="status">
      {Icon && (
        <span className="empty-state-icon" aria-hidden="true">
          <Icon size={22} strokeWidth={1.25} />
        </span>
      )}
      <h2 className="empty-state-title">{title}</h2>
      {description && <p className="empty-state-text">{description}</p>}
      {(action || secondaryAction) && (
        <div className="empty-state-actions">
          {action && <EmptyStateAction {...action} className="btn-main" />}
          {secondaryAction && <EmptyStateAction {...secondaryAction} className="btn-ghost" />}
        </div>
      )}
    </div>
  )
}

/**
 * Shown wherever the marketplace itself is empty — the homepage and the browse
 * page, when no filter is narrowing anything.
 *
 * Pre-launch, an empty catalogue is the plan rather than a fault, so this reads
 * as an announcement instead of an apology. It lives here, once, because it is
 * the copy that has to change on launch day and it should be findable then:
 * after go-live an empty marketplace means something has gone wrong, and this
 * message would be actively misleading.
 */
export function LaunchingSoonState({ tone = 'boxed' }) {
  return (
    <EmptyState
      tone={tone}
      icon={Sparkles}
      title="Something new is coming to Windhoek"
      description="OpenSpace launches soon. Sign up early to list your property or tell us what you're looking for, and we'll connect you the moment we go live."
      action={{ to: '/register', label: 'Sign up early' }}
    />
  )
}

function EmptyStateAction({ to, onClick, label, className }) {
  if (to) return <Link to={to} className={className}>{label}</Link>
  return <button type="button" onClick={onClick} className={className}>{label}</button>
}
