const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect, requireLister } = require('../middleware/auth');

// GET /api/listings — browse with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      unitType,
      neighborhood,
      minRent,
      maxRent,
      available,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (unitType) filter.unitType = unitType;
    if (neighborhood) filter.neighborhood = neighborhood;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }
    if (available !== undefined) filter.isAvailable = available === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('landlord', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filter),
    ]);

    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/my/listings — landlord's own listings (must be before /:id)
router.get('/my/listings', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ landlord: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'landlord',
      'name email phone'
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings
router.post('/', protect, requireLister, async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      landlord: req.user._id,
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
