let express = require('express');
let router = express.Router();

let authController = require('../controllers/auth');

router.post('/register', authController.register);
router.post('/login', authController.signin);
router.get('/profile', authController.getProfile);  // MAKE SURE THIS LINE IS HERE

module.exports = router;