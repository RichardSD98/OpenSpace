const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect, requireLister } = require('../middleware/auth');

// GET /api/listings
router.get('/', async (req, res) => {
  try {
    const { unitType, neighborhood, minRent, maxRent, available, page = 1, limit = 12 } = req.query;
    let query = supabase
      .from('listings')
      .select('*, landlord:profiles(id, name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (unitType) query = query.eq('unit_type', unitType);
    if (neighborhood) query = query.ilike('neighborhood', `%${neighborhood}%`);
    if (minRent) query = query.gte('rent', Number(minRent));
    if (maxRent) query = query.lte('rent', Number(maxRent));
    if (available !== undefined) query = query.eq('is_available', available === 'true');

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const listings = (data || []).map(normalise);
    res.json({ listings, total: count || 0, page: Number(page), pages: Math.ceil((count || 0) / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/my/listings
router.get('/my/listings', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('landlord_id', req.user._id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(normalise));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, landlord:profiles(id, name, email, phone)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ message: 'Listing not found' });
    res.json(normalise(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings
router.post('/', protect, requireLister, async (req, res) => {
  try {
    const body = fromFrontend(req.body, req.user._id);
    const { data, error } = await supabase.from('listings').insert(body).select().single();
    if (error) throw error;
    res.status(201).json(normalise(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('listings').select('landlord_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const body = fromFrontend(req.body, req.user._id);
    delete body.landlord_id;
    body.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('listings').update(body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(normalise(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('listings').select('landlord_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const { error } = await supabase.from('listings').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function normalise(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    unitType: row.unit_type,
    rent: row.rent,
    deposit: row.deposit,
    neighborhood: row.neighborhood,
    address: row.address,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    availableFrom: row.available_from,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    photos: row.photos || [],
    amenities: row.amenities || [],
    isAvailable: row.is_available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    landlord: row.landlord
      ? { _id: row.landlord.id, ...row.landlord }
      : { _id: row.landlord_id },
  };
}

function fromFrontend(body, landlordId) {
  return {
    landlord_id: landlordId,
    title: body.title,
    description: body.description,
    unit_type: body.unitType,
    rent: Number(body.rent),
    deposit: Number(body.deposit) || 0,
    neighborhood: body.neighborhood,
    address: body.address,
    bedrooms: Number(body.bedrooms) || 1,
    bathrooms: Number(body.bathrooms) || 1,
    available_from: body.availableFrom,
    contact_name: body.contactName,
    contact_phone: body.contactPhone,
    contact_email: body.contactEmail,
    photos: body.photos || [],
    amenities: body.amenities || [],
    is_available: body.isAvailable !== false,
  };
}

module.exports = router;

  try {
    const { unitType, neighborhood, minRent, maxRent, available, page = 1, limit = 12 } = req.query;
    let query = supabase
      .from('listings')
      .select('*, landlord:profiles(id, name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (unitType) query = query.eq('unit_type', unitType);
    if (neighborhood) query = query.ilike('neighborhood', `%${neighborhood}%`);
    if (minRent) query = query.gte('rent', Number(minRent));
    if (maxRent) query = query.lte('rent', Number(maxRent));
    if (available !== undefined) query = query.eq('is_available', available === 'true');

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Normalise field names to match existing frontend expectations
    const listings = (data || []).map(normalise);
    res.json({ listings, total: count || 0, page: Number(page), pages: Math.ceil((count || 0) / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/my/listings
router.get('/my/listings', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('landlord_id', req.user._id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(normalise));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, landlord:profiles(id, name, email, phone)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ message: 'Listing not found' });
    res.json(normalise(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings
router.post('/', protect, requireLister, async (req, res) => {
  try {
    const body = fromFrontend(req.body, req.user._id);
    const { data, error } = await supabase.from('listings').insert(body).select().single();
    if (error) throw error;
    res.status(201).json(normalise(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('listings').select('landlord_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const body = fromFrontend(req.body, req.user._id);
    delete body.landlord_id; // don't overwrite landlord
    body.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('listings').update(body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(normalise(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('listings').select('landlord_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const { error } = await supabase.from('listings').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Helpers ──────────────────────────────────────────────────────────

// Convert Supabase snake_case to camelCase for frontend compatibility
function normalise(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    unitType: row.unit_type,
    rent: row.rent,
    deposit: row.deposit,
    neighborhood: row.neighborhood,
    address: row.address,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    availableFrom: row.available_from,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    photos: row.photos || [],
    amenities: row.amenities || [],
    isAvailable: row.is_available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    landlord: row.landlord
      ? { _id: row.landlord.id, ...row.landlord }
      : { _id: row.landlord_id },
  };
}

// Convert frontend camelCase to Supabase snake_case
function fromFrontend(body, landlordId) {
  return {
    landlord_id: landlordId,
    title: body.title,
    description: body.description,
    unit_type: body.unitType,
    rent: Number(body.rent),
    deposit: Number(body.deposit) || 0,
    neighborhood: body.neighborhood,
    address: body.address,
    bedrooms: Number(body.bedrooms) || 1,
    bathrooms: Number(body.bathrooms) || 1,
    available_from: body.availableFrom,
    contact_name: body.contactName,
    contact_phone: body.contactPhone,
    contact_email: body.contactEmail,
    photos: body.photos || [],
    amenities: body.amenities || [],
    is_available: body.isAvailable !== false,
  };
}

module.exports = router;

  try {
    const { unitType, neighborhood, minRent, maxRent, available, page = 1, limit = 12 } = req.query;
    let query = supabase
      .from('listings')
      .select('*, landlord:profiles(id, name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (unitType) query = query.eq('unit_type', unitType);
    if (neighborhood) query = query.ilike('neighborhood', `%${neighborhood}%`);
    if (minRent) query = query.gte('rent', Number(minRent));
    if (maxRent) query = query.lte('rent', Number(maxRent));
    if (available !== undefined) query = query.eq('is_available', available === 'true');

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const listings = (data || []).map(normalise);
    res.json({ listings, total: count || 0, page: Number(page), pages: Math.ceil((count || 0) / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/my/listings
router.get('/my/listings', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('landlord_id', req.user._id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(normalise));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, landlord:profiles(id, name, email, phone)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ message: 'Listing not found' });
    res.json(normalise(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings
router.post('/', protect, requireLister, async (req, res) => {
  try {
    const body = fromFrontend(req.body, req.user._id);
    const { data, error } = await supabase.from('listings').insert(body).select().single();
    if (error) throw error;
    res.status(201).json(normalise(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('listings').select('landlord_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const body = fromFrontend(req.body, req.user._id);
    delete body.landlord_id;
    body.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('listings').update(body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(normalise(data));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('listings').select('landlord_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Listing not found' });
    if (existing.landlord_id !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    const { error } = await supabase.from('listings').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function normalise(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    unitType: row.unit_type,
    rent: row.rent,
    deposit: row.deposit,
    neighborhood: row.neighborhood,
    address: row.address,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    availableFrom: row.available_from,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    photos: row.photos || [],
    amenities: row.amenities || [],
    isAvailable: row.is_available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    landlord: row.landlord
      ? { _id: row.landlord.id, ...row.landlord }
      : { _id: row.landlord_id },
  };
}

function fromFrontend(body, landlordId) {
  return {
    landlord_id: landlordId,
    title: body.title,
    description: body.description,
    unit_type: body.unitType,
    rent: Number(body.rent),
    deposit: Number(body.deposit) || 0,
    neighborhood: body.neighborhood,
    address: body.address,
    bedrooms: Number(body.bedrooms) || 1,
    bathrooms: Number(body.bathrooms) || 1,
    available_from: body.availableFrom,
    contact_name: body.contactName,
    contact_phone: body.contactPhone,
    contact_email: body.contactEmail,
    photos: body.photos || [],
    amenities: body.amenities || [],
    is_available: body.isAvailable !== false,
  };
}

module.exports = router;
