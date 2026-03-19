let ActivityLog = require('../models/activityLog');

// Get my own activities
exports.getMyActivities = async (req, res) => {
  try {
    let activities = await ActivityLog.find({ user: req.auth.id })
      .populate('user', 'firstName lastName username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: activities.length,
      activities: activities
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get activities for a specific user
exports.getUserActivities = async (req, res) => {
  try {
    let activities = await ActivityLog.find({ user: req.params.userId })
      .populate('user', 'firstName lastName username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: activities.length,
      activities: activities
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all activities (admin only)
exports.getAllActivities = async (req, res) => {
  try {
    // Check if user is admin
    if (req.auth.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    let activities = await ActivityLog.find()
      .populate('user', 'firstName lastName username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: activities.length,
      activities: activities
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
