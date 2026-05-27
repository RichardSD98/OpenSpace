// Reusable skeleton building blocks
export function SkeletonBox({ width = '100%', height = '1rem', radius = '2px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

// Matches ListingCard layout
export function SkeletonCard() {
  return (
    <div className="listing" style={{ pointerEvents: 'none' }}>
      <SkeletonBox height="200px" radius="2px" style={{ marginBottom: '0.75rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <SkeletonBox width="30%" height="1.1rem" />
        <SkeletonBox width="22%" height="1.1rem" radius="999px" />
      </div>
      <SkeletonBox width="70%" height="1rem" style={{ marginBottom: '0.4rem' }} />
      <SkeletonBox width="50%" height="0.85rem" style={{ marginBottom: '0.75rem' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SkeletonBox width="25%" height="0.8rem" />
        <SkeletonBox width="28%" height="0.8rem" />
      </div>
    </div>
  )
}

// Matches ListingDetail layout
export function SkeletonDetail() {
  return (
    <div className="detail-wrap" style={{ pointerEvents: 'none' }}>
      {/* Photo */}
      <SkeletonBox height="420px" radius="2px" style={{ marginBottom: '2rem' }} />

      <div className="detail-body">
        <div className="detail-main">
          <SkeletonBox width="60%" height="2rem" style={{ marginBottom: '0.75rem' }} />
          <SkeletonBox width="40%" height="1rem" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <SkeletonBox width="80px" height="2rem" radius="999px" />
            <SkeletonBox width="100px" height="2rem" radius="999px" />
            <SkeletonBox width="90px" height="2rem" radius="999px" />
          </div>
          <SkeletonBox width="100%" height="0.85rem" style={{ marginBottom: '0.4rem' }} />
          <SkeletonBox width="90%" height="0.85rem" style={{ marginBottom: '0.4rem' }} />
          <SkeletonBox width="75%" height="0.85rem" style={{ marginBottom: '2rem' }} />
          <SkeletonBox width="100%" height="0.85rem" style={{ marginBottom: '0.4rem' }} />
          <SkeletonBox width="80%" height="0.85rem" />
        </div>

        <div className="detail-sidebar">
          <SkeletonBox width="50%" height="2rem" style={{ marginBottom: '0.5rem' }} />
          <SkeletonBox width="70%" height="0.85rem" style={{ marginBottom: '2rem' }} />
          <SkeletonBox height="2.75rem" radius="2px" style={{ marginBottom: '0.75rem' }} />
          <SkeletonBox height="2.75rem" radius="2px" style={{ marginBottom: '0.75rem' }} />
          <SkeletonBox height="2.75rem" radius="2px" />
        </div>
      </div>
    </div>
  )
}

// Matches MyListings row layout
export function SkeletonListingRow() {
  return (
    <div className="my-listing-row" style={{ pointerEvents: 'none' }}>
      <div className="my-listing-thumb">
        <SkeletonBox height="100%" radius="2px" />
      </div>
      <div className="my-listing-body">
        <div className="my-listing-info">
          <SkeletonBox width="55%" height="1.2rem" style={{ marginBottom: '0.5rem' }} />
          <SkeletonBox width="70%" height="0.85rem" style={{ marginBottom: '0.4rem' }} />
          <SkeletonBox width="30%" height="1rem" style={{ marginBottom: '0.4rem' }} />
          <SkeletonBox width="35%" height="0.8rem" />
        </div>
        <div className="my-listing-actions" style={{ gap: '0.5rem' }}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} width="70px" height="2rem" radius="2px" />
          ))}
        </div>
      </div>
    </div>
  )
}
