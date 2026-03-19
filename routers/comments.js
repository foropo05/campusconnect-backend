let express = require('express');
let router = express.Router({ mergeParams: true });

let commentsController = require('../controllers/comments');
let authController = require('../controllers/auth');

// Get all comments for a post
router.get('/:postId', commentsController.getComments);

// Add comment
router.post('/:postId', authController.requireSignin, authController.logToken, commentsController.addComment);

// Update comment
router.put('/:postId/:commentId', authController.requireSignin, authController.logToken, commentsController.updateComment);

// Delete comment
router.delete('/:postId/:commentId', authController.requireSignin, authController.logToken, commentsController.deleteComment);

module.exports = router;