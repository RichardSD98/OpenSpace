const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');

// POST /api/view-requests/:listingId
router.post('/:listingId', protect, async (req, res) => {
  try {
    const { data: listing, error: listErr } = await supabase
      .from('listings').select('id').eq('id', req.params.listingId).single();
    if (listErr || !listing) return res.status(404).json({ message: 'Listing not found' });

    const { data, error } = await supabase.from('view_requests').insert({
      listing_id: req.params.listingId,
      renter_id: req.user._id,
      message: req.body.message || '',
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'You have already requested to view this listing' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/view-requests/my
router.get('/my', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('view_requests')
      .select('*, listing:listings(id, title, neighborhood, rent, unit_type, photos)')
      .eq('renter_id', req.user._id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const requests = (data || []).map(r => ({
      ...r,
      listing: r.listing
        ? { _id: r.listing.id, ...r.listing, unitType: r.listing.unit_type }
        : null,
    }));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/view-requests/listing/:listingId
router.get('/listing/:listingId', protect, async (req, res) => {
  try {
    const { data: listing, error: listErr } = await supabase
      .from('listings').select('id, landlord_id').eq('id', req.params.listingId).single();
    if (listErr || !listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const { data, error } = await supabase
      .from('view_requests')
      .select('*, renter:profiles(id, name, email, phone)')
      .eq('listing_id', req.params.listingId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const requests = (data || []).map(r => ({
      ...r,
      renter: r.renter ? { _id: r.renter.id, ...r.renter } : null,
    }));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


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
