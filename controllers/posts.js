

const Post = require('../models/post');
const ActivityLog = require('../models/activityLog');
const { validationResult } = require('express-validator');

/**
 * Get all posts (public access)
 * Shows only active posts for anonymous users
 * Shows all posts for authenticated users
 */
exports.postList = async (req, res) => {
  try {
    let query = {};
    
    // If user is not authenticated, only show active posts
    if (!req.user || !req.user.id) {
      query.status = 'active';
    }
    
    const posts = await Post.find(query)
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error('Error in postList:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
};

/**
 * Get single post by ID (public access)
 */
exports.getByID = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName username');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // If post is not active, only authenticated users can see it
    if (post.status !== 'active' && (!req.user || !req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this post'
      });
    }
    
    res.json({
      success: true,
      post: post
    });
  } catch (error) {
    console.error('Error in getByID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
};

/**
 * Add new post (authenticated users only)
 */
exports.processAdd = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Create new post
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      status: req.body.status || 'active',
      location: req.body.location,
      eventDate: req.body.eventDate,
      author: req.user.id
    });

    const savedPost = await newPost.save();
    
    // Log the activity
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: 'CREATE',
      target: `Post: ${savedPost.title}`
    });
    await activityLog.save();

    // Populate author info before sending response
    await savedPost.populate('author', 'firstName lastName username');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost
    });
  } catch (error) {
    console.error('Error in processAdd:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
};

/**
 * Edit post (only author or admin)
 */
exports.processEdit = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post'
      });
    }

    // Update fields
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.category = req.body.category || post.category;
    post.status = req.body.status || post.status;
    post.location = req.body.location || post.location;
    post.eventDate = req.body.eventDate || post.eventDate;

    const updatedPost = await post.save();
    
    // Log the activity
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: 'UPDATE',
      target: `Post: ${updatedPost.title}`
    });
    await activityLog.save();

    await updatedPost.populate('author', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error in processEdit:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
};

/**
 * Delete post (soft delete - change status to cancelled/expired)
 * Only author or admin
 */
exports.performDelete = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    // Soft delete - change status to 'cancelled' or 'expired'
    post.status = 'cancelled';
    await post.save();
    
    // Log the activity
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: 'DELETE',
      target: `Post: ${post.title}`
    });
    await activityLog.save();

    res.json({
      success: true,
      message: 'Post deleted successfully (status changed to cancelled)'
    });
  } catch (error) {
    console.error('Error in performDelete:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
};
