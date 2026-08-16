const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six']

// A shared listing splits between its bedrooms, so a three-bed flat quotes a
// third each rather than a half. Studios and single rooms still split two ways.
export function shareCount(bedrooms) {
  return Math.max(2, Number(bedrooms) || 2)
}

export function sharersLabel(bedrooms) {
  const count = shareCount(bedrooms)
  return `${NUMBER_WORDS[count] || count} sharing`
}

export function formatMoney(amount) {
  return `N$${Number(amount).toLocaleString()}`
}

// Per-person rent for a shared listing, or null when there is no rent to split.
export function splitRent(rent, bedrooms) {
  const amount = Number(rent)
  if (!amount || amount <= 0) return null
  return Math.ceil(amount / shareCount(bedrooms))
}
