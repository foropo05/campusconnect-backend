let express = require('express');
let router = express.Router();

let authController = require('../controllers/auth');

router.post('/register', authController.register);
router.post('/login', authController.signin);

module.exports = router;