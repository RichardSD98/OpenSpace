const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { sendViewRequestStatusEmail } = require('../services/email');

// GET /api/view-requests/all — landlord sees all requests across all their listings
router.get('/all', protect, async (req, res) => {
  try {
    const { data: listings, error: listErr } = await supabase
      .from('listings').select('id').eq('landlord_id', req.user._id);
    if (listErr) throw listErr;
    if (!listings || listings.length === 0) return res.json([]);

    const listingIds = listings.map(l => l.id);
    const { data, error } = await supabase
      .from('view_requests')
      .select('*, listing:listings(id, title, neighborhood, photos), renter:profiles(id, name, email, phone)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json((data || []).map(r => ({
      ...r,
      listing: r.listing ? { _id: r.listing.id, ...r.listing } : null,
      renter: r.renter ? { _id: r.renter.id, ...r.renter } : null,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/view-requests/:id/status — landlord accepts or declines
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "declined"' });
    }

    const { data: viewReq, error: fetchErr } = await supabase
      .from('view_requests')
      .select('*, listing:listings(id, title, landlord_id), renter:profiles(id, name, email)')
      .eq('id', req.params.id)
      .single();
    if (fetchErr || !viewReq) return res.status(404).json({ message: 'Request not found' });
    if (viewReq.listing.landlord_id !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('view_requests').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;

    try {
      if (viewReq.renter?.email) {
        await sendViewRequestStatusEmail({
          renterName: viewReq.renter.name,
          renterEmail: viewReq.renter.email,
          listingTitle: viewReq.listing.title,
          status,
        });
      }
    } catch (emailErr) {
      console.warn('Status notification email failed:', emailErr.message);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/view-requests/:id — renter cancels their own request
router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: viewReq, error: fetchErr } = await supabase
      .from('view_requests').select('id, renter_id').eq('id', req.params.id).single();
    if (fetchErr || !viewReq) return res.status(404).json({ message: 'Request not found' });
    if (viewReq.renter_id !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { error } = await supabase.from('view_requests').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
