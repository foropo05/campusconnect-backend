let express = require('express');
let router = express.Router({ mergeParams: true });

let rsvpController = require('../controllers/rsvp');
let authController = require('../controllers/auth');

// Get all RSVPs for a post
router.get('/:postId', rsvpController.getRSVPs);

// Create or update RSVP
router.post('/:postId', authController.requireSignin, authController.logToken, rsvpController.processRSVP);

// Delete RSVP
router.delete('/:postId', authController.requireSignin, authController.logToken, rsvpController.deleteRSVP);

module.exports = router;