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
