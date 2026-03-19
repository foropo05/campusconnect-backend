let express = require('express');
let router = express.Router();

let activityController = require('../controllers/activity');
let authController = require('../controllers/auth');

// Get my activities (logged-in user)
router.get('/me',
  authController.requireSignin,
  authController.logToken,
  activityController.getMyActivities
);

// Get activities of a specific user
router.get('/user/:userId',
  authController.requireSignin,
  authController.logToken,
  activityController.getUserActivities
);

// Get all activities (admin only)
router.get('/',
  authController.requireSignin,
  authController.logToken,
  activityController.getAllActivities
);

module.exports = router;