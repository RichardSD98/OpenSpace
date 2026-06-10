const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const supabase = require('../config/supabase');

const BUCKET = 'listing-photos';

// POST /api/upload — upload up to 6 images to Supabase Storage
router.post('/', protect, upload.array('photos', 6), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const filename = `${uuidv4()}${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) throw error;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        return data.publicUrl;
      })
    );

    res.json({ urls: uploads });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed. Please try again.' });
  }
});

module.exports = router;
