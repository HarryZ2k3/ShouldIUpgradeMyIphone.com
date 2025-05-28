// File: routes/auth.js

const express       = require('express');
const passport      = require('passport');
const bcrypt        = require('bcrypt');
const multer        = require('multer');
const path          = require('path');
const fs            = require('fs');
const User          = require('../models/User');
const router        = express.Router();

// configure multer to store uploads under /uploads
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 2 * 1024 * 1024 } // max 2 MB
});

// — Register via email/password —
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash });
    req.login(user, err => {
      if (err) return res.sendStatus(500);
      res.json(user);
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// — Login via email/password —
router.post(
  '/login',
  passport.authenticate('local'),
  (req, res) => res.json(req.user)
);

// — Google OAuth flow —
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile','email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect:  process.env.FRONTEND_URL,
    failureRedirect:  `${process.env.FRONTEND_URL}/login`
  })
);

// — Logout —
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

// — Get current user —
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  res.json(req.user);
});

// — Update currentModel —
router.put('/me/model', async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  req.user.currentModel = req.body.model;
  await req.user.save();
  res.json({ currentModel: req.user.currentModel });
});

// — Upload new avatar —
// expects `avatar` field in multipart/form-data
router.post(
  '/me/avatar',
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      // remove old avatar file (if any)
      if (req.user.avatarUrl) {
        const oldFilename = path.basename(req.user.avatarUrl);
        const oldPath     = path.join(__dirname, '../uploads/', oldFilename);
        fs.unlink(oldPath, () => {});
      }

      // save new avatar URL on user record
      const avatarUrl = `/uploads/${req.file.filename}`;
      req.user.avatarUrl = avatarUrl;
      await req.user.save();

      res.json({ avatarUrl });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
