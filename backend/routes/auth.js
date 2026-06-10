const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = require('../config/supabase');
const { protect } = require('../middleware/auth');

function createPublicSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function hashIdentifier(value) {
  return crypto
    .createHash('sha256')
    .update(String(value || '').trim().toLowerCase())
    .digest('hex');
}

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function validateStrongPassword(password) {
  if (typeof password !== 'string') return 'Password is required.';
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character.';
  return null;
}

async function verifyTurnstile(captchaToken, req) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!captchaToken) return false;

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: captchaToken,
    remoteip: getIp(req),
  });

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) return false;
  const result = await response.json();
  return !!result.success;
}

async function logSecurityEvent({
  eventType,
  status,
  req,
  email,
  reason,
  metadata,
}) {
  const payload = {
    event_type: eventType,
    event_status: status,
    email_hash: email ? hashIdentifier(email) : null,
    ip_hash: hashIdentifier(getIp(req)),
    user_agent: req.headers['user-agent'] || '',
    reason: reason || null,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from('security_audit_logs').insert(payload);
  if (error) {
    console.warn('security_audit_logs insert failed:', error.message);
    console.info('security_event_fallback', payload);
  }
}

const GENERIC_FORGOT_RESPONSE = {
  message:
    'If an account exists for that email, a password reset email has been sent. Check your inbox for next steps.',
};

// POST /api/auth/forgot-password — starts secure reset flow without account enumeration
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const publicSupabase = createPublicSupabaseClient();
    if (!publicSupabase) {
      return res.status(503).json({ message: 'Password reset service is not configured.' });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const captchaToken = req.body?.captchaToken;

    if (!isValidEmail(email)) {
      await logSecurityEvent({
        eventType: 'password_reset_requested',
        status: 'rejected',
        req,
        email,
        reason: 'invalid_email_format',
      });
      return res.json(GENERIC_FORGOT_RESPONSE);
    }

    const captchaOk = await verifyTurnstile(captchaToken, req);
    if (!captchaOk) {
      await logSecurityEvent({
        eventType: 'password_reset_requested',
        status: 'rejected',
        req,
        email,
        reason: 'captcha_failed',
      });
      return res.status(400).json({ message: 'Unable to process request. Please try again.' });
    }

    await publicSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });

    await logSecurityEvent({
      eventType: 'password_reset_requested',
      status: 'accepted',
      req,
      email,
    });
  } catch (err) {
    await logSecurityEvent({
      eventType: 'password_reset_requested',
      status: 'error',
      req,
      email,
      reason: err.message,
    });

    return res.json(GENERIC_FORGOT_RESPONSE);
  }

  return res.json(GENERIC_FORGOT_RESPONSE);
});

// POST /api/auth/reset-password — verifies recovery tokens and updates password securely
router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(503).json({ message: 'Password reset service is not configured.' });
    }

    const accessToken = String(req.body?.accessToken || '');
    const refreshToken = String(req.body?.refreshToken || '');
    const password = String(req.body?.password || '');
    const captchaToken = req.body?.captchaToken;

    const passwordError = validateStrongPassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const captchaOk = await verifyTurnstile(captchaToken, req);
    if (!captchaOk) {
      return res.status(400).json({ message: 'Unable to process request. Please try again.' });
    }

    if (!accessToken || !refreshToken) {
      await logSecurityEvent({
        eventType: 'password_reset_completed',
        status: 'rejected',
        req,
        reason: 'missing_or_invalid_token',
      });
      return res.status(400).json({ message: 'Reset link is invalid or expired.' });
    }

    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      await logSecurityEvent({
        eventType: 'password_reset_completed',
        status: 'rejected',
        req,
        reason: 'token_verification_failed',
        metadata: { code: sessionError.code || null },
      });
      return res.status(400).json({ message: 'Reset link is invalid or expired.' });
    }

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user?.email) {
      await logSecurityEvent({
        eventType: 'password_reset_completed',
        status: 'rejected',
        req,
        reason: 'user_lookup_failed',
      });
      return res.status(400).json({ message: 'Reset link is invalid or expired.' });
    }

    const signInCheck = await client.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInCheck.data?.session) {
      await client.auth.signOut();
      await logSecurityEvent({
        eventType: 'password_reset_completed',
        status: 'rejected',
        req,
        email: user.email,
        reason: 'password_reuse',
      });
      return res.status(400).json({ message: 'New password must be different from your current password.' });
    }

    const { error: updateError } = await client.auth.updateUser({ password });
    if (updateError) {
      await logSecurityEvent({
        eventType: 'password_reset_completed',
        status: 'error',
        req,
        email: user.email,
        reason: updateError.message,
        metadata: { code: updateError.code || null },
      });
      return res.status(400).json({ message: 'Unable to reset password. Please request a new link.' });
    }

    await client.auth.signOut();

    await logSecurityEvent({
      eventType: 'password_reset_completed',
      status: 'accepted',
      req,
      email: user.email,
    });

    return res.json({
      message: 'Password has been reset successfully. Please sign in again.',
      mfaRecommendation: 'For better account security, enable MFA in your account settings.',
    });
  } catch (err) {
    await logSecurityEvent({
      eventType: 'password_reset_completed',
      status: 'error',
      req,
      reason: err.message,
    });
    return res.status(500).json({ message: 'Unable to process reset request. Please try again.' });
  }
});

// GET /api/auth/me — returns current user profile
router.get('/me', protect, (req, res) => {
  const { _id, id, email, name, phone, role, isVerified } = req.user;
  res.json({ _id, id, email, name, phone, role, isVerified: isVerified ?? true });
});

// PUT /api/auth/profile — update display name and phone
router.put('/profile', protect, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ name, phone, updated_at: new Date().toISOString() })
      .eq('id', req.user._id)
      .select()
      .single();

    if (error) throw error;
    res.json({ name: data.name, phone: data.phone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/auth/account — GDPR account deletion
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete profile row first (cascade-safe)
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Delete the auth user via service role
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    res.json({ message: 'Your account has been permanently deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;

