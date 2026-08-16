// Recently viewed is a list of listing IDs, not listing data.
//
// It used to store whole listing objects, which made localStorage a stale
// mirror of the database: a listing that was edited showed its old rent, and
// one that was taken down stayed on the homepage forever with broken images
// where its photos had been. An ID is a claim about what someone looked at,
// which stays true; the listing itself is the database's to answer for.
//
// Reading therefore never returns listings, only IDs. The caller fetches them
// and drops whatever no longer resolves, so the section can only ever show
// listings that both exist and were actually viewed.

const KEY = 'os_recently_viewed'
const LIMIT = 6

// Entries were objects before this change, so a returning visitor still has
// the old shape in their browser. Accept both and normalise to an ID.
function toId(entry) {
  if (typeof entry === 'string') return entry
  return entry?.id || entry?._id || null
}

export function readRecentlyViewedIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(stored)) return []
    return [...new Set(stored.map(toId).filter(Boolean))].slice(0, LIMIT)
  } catch {
    // Unparseable means someone else's data or a truncated write; either way it
    // cannot be repaired, so drop it rather than let it throw on every load.
    localStorage.removeItem(KEY)
    return []
  }
}

export function writeRecentlyViewedIds(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, LIMIT)))
  } catch {
    // Private browsing and a full quota both throw here. Losing the history is
    // not worth breaking the page over.
  }
}

// Most recent first, no duplicates.
export function recordRecentlyViewed(id) {
  if (!id) return
  writeRecentlyViewedIds([id, ...readRecentlyViewedIds().filter(existing => existing !== id)])
}
