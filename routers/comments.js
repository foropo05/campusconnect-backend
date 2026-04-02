let express = require('express');
let router = express.Router({ mergeParams: true });

let commentsController = require('../controllers/comments');
let authController = require('../controllers/auth');

// @route  GET /api/posts/:postId/comments
// @desc   Get all comments for a post
// @access Public
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: 1 });

    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route  POST /api/posts/:postId/comments
// @desc   Add a comment to a post
// @access Private
router.post(
  '/',
  auth,
  [body('text').notEmpty().withMessage('Comment text is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = new Comment({
        text: req.body.text,
        author: req.user.id,
        post: req.params.postId,
      });

      await comment.save();
      await comment.populate('author', 'firstName lastName username');

      return res.status(201).json(comment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route  PUT /api/posts/:postId/comments/:commentId
// @desc   Update a comment (author or admin only)
// @access Private
router.put(
  '/:commentId',
  auth,
  [body('text').notEmpty().withMessage('Comment text is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      if (
        comment.author.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      comment.text = req.body.text;
      await comment.save();
      await comment.populate('author', 'firstName lastName username');

      return res.json(comment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route  DELETE /api/posts/:postId/comments/:commentId
// @desc   Delete a comment (author or admin only)
// @access Private
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await comment.deleteOne();
    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
