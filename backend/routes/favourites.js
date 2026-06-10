const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');

// GET /api/favourites — get current user's saved listings
router.get('/', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favourites')
      .select('listing_id, created_at, listing:listings(id, title, neighborhood, rent, unit_type, photos, is_available)')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const listings = (data || [])
      .filter(f => f.listing)
      .map(f => ({
        _id: f.listing.id,
        id: f.listing.id,
        title: f.listing.title,
        neighborhood: f.listing.neighborhood,
        rent: f.listing.rent,
        unitType: f.listing.unit_type,
        photos: f.listing.photos || [],
        isAvailable: f.listing.is_available,
        savedAt: f.created_at,
      }));

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/favourites/:listingId — save a listing
router.post('/:listingId', protect, async (req, res) => {
  try {
    const { data: listing, error: listErr } = await supabase
      .from('listings').select('id').eq('id', req.params.listingId).single();
    if (listErr || !listing) return res.status(404).json({ message: 'Listing not found' });

    const { error } = await supabase.from('favourites').insert({
      user_id: req.user._id,
      listing_id: req.params.listingId,
    });

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Already saved' });
      }
      throw error;
    }
    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/favourites/:listingId — remove a saved listing
router.delete('/:listingId', protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', req.user._id)
      .eq('listing_id', req.params.listingId);
    if (error) throw error;
    res.json({ message: 'Removed from saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/favourites/ids — returns just the listing IDs the user has saved (for quick UI checks)
router.get('/ids', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favourites')
      .select('listing_id')
      .eq('user_id', req.user._id);
    if (error) throw error;
    res.json((data || []).map(f => f.listing_id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
