let RSVP = require('../models/rsvp');
let Post = require('../models/post');

// Get all RSVPs for a post
exports.getRSVPs = async (req, res) => {
  try {
    let rsvps = await RSVP.find({ event: req.params.postId })
      .populate('user', 'firstName lastName username');
    
    res.json({
      success: true,
      count: rsvps.length,
      rsvps: rsvps
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create or update RSVP
exports.processRSVP = async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if it's an event post
    if (post.category !== 'event') {
      return res.status(400).json({
        success: false,
        message: 'RSVPs only allowed for event posts'
      });
    }

    // Find existing RSVP or create new
    let rsvp = await RSVP.findOneAndUpdate(
      { 
        user: req.user.id, 
        event: req.params.postId 
      },
      { 
        status: req.body.status || 'going' 
      },
      { 
        upsert: true, 
        new: true 
      }
    ).populate('user', 'firstName lastName username');

    res.json({
      success: true,
      message: 'RSVP saved successfully',
      rsvp: rsvp
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete RSVP
exports.deleteRSVP = async (req, res) => {
  try {
    let rsvp = await RSVP.findOneAndDelete({
      user: req.user.id,
      event: req.params.postId
    });

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    res.json({
      success: true,
      message: 'RSVP removed successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
