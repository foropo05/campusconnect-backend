let Comment = require('../models/comments');
let Post = require('../models/post');

// Get all comments for a post
exports.getComments = async (req, res) => {
  try {
    let comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      count: comments.length,
      comments: comments
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    let newComment = new Comment({
      text: req.body.text,
      author: req.auth.id,
      post: req.params.postId
    });

    let savedComment = await newComment.save();
    await savedComment.populate('author', 'firstName lastName username');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: savedComment
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.auth.id && req.autht.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment'
      });
    }

    comment.text = req.body.text;
    let updatedComment = await comment.save();
    await updatedComment.populate('author', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.auth.id && req.auth.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
