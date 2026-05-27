const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/auth/me — returns current user profile
router.get('/me', protect, (req, res) => {
  const { _id, id, email, name, phone, role, isVerified } = req.user;
  res.json({ _id, id, email, name, phone, role, isVerified: isVerified ?? true });
});

module.exports = router;
