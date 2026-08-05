import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import ResponsiveImage from './ui/ResponsiveImage'
import { SIZES_CARD } from './ui/imageUtils'

export const listingCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function ListingCard({ listing, index = 0 }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const imgClasses = ['img-a', 'img-b', 'img-c']
  const imgClass = imgClasses[index % 3]

  return (
    <motion.div
      className="listing"
      onClick={() => navigate(`/listings/${listing._id}`)}
      variants={reduceMotion ? undefined : listingCardVariants}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`listing-img ${imgClass}`}>
        {listing.photos && listing.photos.length > 0 ? (
          <ResponsiveImage
            src={listing.photos[0]}
            alt={listing.title}
            aspectRatio="auto"
            sizes={SIZES_CARD}
            wrapperClassName="h-full"
            className="h-full"
          />
        ) : (
          <div className="img-inner"><div className="img-shape"></div></div>
        )}
        {listing.isAvailable !== false && (
          <span className="v-badge">Available</span>
        )}
      </div>
      <div className="listing-top">
        <div className="listing-price">
          N${listing.rent.toLocaleString()} <small>/mo</small>
        </div>
        <span className="listing-type-pill">{listing.unitType}</span>
      </div>
      <div className="listing-name">{listing.title}</div>
      <div className="listing-loc">{listing.neighborhood}, Windhoek</div>
      <div className="listing-meta">
        {listing.bedrooms != null && (
          <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
        )}
        {listing.deposit > 0 && (
          <span>N${listing.deposit.toLocaleString()} deposit</span>
        )}
        {listing.sharedRent && (
          <span>Shared rent OK</span>
        )}
        {listing.availableFrom && new Date(listing.availableFrom) <= new Date() && (
          <span>Available now</span>
        )}
      </div>
    </motion.div>
  )
}
