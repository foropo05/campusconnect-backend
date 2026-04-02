let Post = require('../models/post');

// Get all posts
exports.postList = async (req, res) => {
  try {
    let query = {};
    
    // If not logged in, only show active posts
    if (!req.user) {
      query.status = 'active';
    }
    
    let posts = await Post.find(query)
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get post by ID
exports.getByID = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName username');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if post is active or user is logged in
    if (post.status !== 'active' && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this post'
      });
    }
    
    res.json({
      success: true,
      post: post
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add new post
exports.processAdd = async (req, res) => {
  try {
    let newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      status: req.body.status || 'active',
      location: req.body.location,
      eventDate: req.body.eventDate,
      author: req.user.id
    });

    let savedPost = await newPost.save();
    await savedPost.populate('author', 'firstName lastName username');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Edit post
exports.processEdit = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }

    // Update fields
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.category = req.body.category || post.category;
    post.status = req.body.status || post.status;
    post.location = req.body.location || post.location;
    post.eventDate = req.body.eventDate || post.eventDate;

    let updatedPost = await post.save();
    await updatedPost.populate('author', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete post (soft delete)
exports.performDelete = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete - change status
    post.status = 'cancelled';
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
