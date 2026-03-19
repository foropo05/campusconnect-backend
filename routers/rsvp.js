const express = require('express');
const router = express.Router({ mergeParams: true }); // access :postId from parent router
const { body, validationResult } = require('express-validator');

const auth = require('../middleware/auth');
const RSVP = require('../models/rsvp');
const Post = require('../models/post');

// @route  GET /api/posts/:postId/rsvp
// @desc   Get all RSVPs for an event post
// @access Public
router.get('/', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.postId }).populate(
      'user',
      'firstName lastName username'
    );

    return res.json(rsvps);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route  POST /api/posts/:postId/rsvp
// @desc   Create or update an RSVP for an event post
// @access Private
router.post(
  '/',
  auth,
  [
    body('status')
      .isIn(['going', 'interested', 'not going'])
      .withMessage('Status must be going, interested, or not going'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      if (post.category !== 'event') {
        return res
          .status(400)
          .json({ message: 'RSVPs are only allowed for event posts' });
      }

      // Upsert: one RSVP per user per event
      const rsvp = await RSVP.findOneAndUpdate(
        { user: req.user.id, event: req.params.postId },
        { status: req.body.status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate('user', 'firstName lastName username');

      return res.status(200).json(rsvp);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route  DELETE /api/posts/:postId/rsvp
// @desc   Remove the current user's RSVP
// @access Private
router.delete('/', auth, async (req, res) => {
  try {
    const rsvp = await RSVP.findOneAndDelete({
      user: req.user.id,
      event: req.params.postId,
    });

    if (!rsvp) return res.status(404).json({ message: 'RSVP not found' });

    return res.json({ message: 'RSVP removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
