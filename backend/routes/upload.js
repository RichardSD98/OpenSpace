const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// POST /api/upload — upload up to 6 images
router.post('/', protect, upload.array('photos', 6), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const urls = req.files.map(
    (file) =>
      `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
  );

  res.json({ urls });
});

module.exports = router;
