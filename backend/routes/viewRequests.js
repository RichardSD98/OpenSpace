const express = require('express');
const router = express.Router();
const ViewRequest = require('../models/ViewRequest');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// POST /api/view-requests/:listingId — renter requests to view
router.post('/:listingId', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const existing = await ViewRequest.findOne({
      listing: req.params.listingId,
      renter: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already requested to view this listing' });
    }

    const request = await ViewRequest.create({
      listing: req.params.listingId,
      renter: req.user._id,
      message: req.body.message || '',
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/view-requests/my — renter sees their own requests
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await ViewRequest.find({ renter: req.user._id })
      .populate('listing', 'title neighborhood rent unitType photos')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/view-requests/listing/:listingId — landlord sees requests for a listing
router.get('/listing/:listingId', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const requests = await ViewRequest.find({ listing: req.params.listingId })
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
