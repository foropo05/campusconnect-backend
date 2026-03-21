let express = require('express');
let router = express.Router();

let authController = require('../controllers/auth');
let usersController = require('../controllers/user');

router.get('/', authController.requireSignin, authController.logToken, usersController.userList);
router.get('/:id', authController.requireSignin, authController.logToken, usersController.getByID);
router.put('/:id', authController.requireSignin, authController.logToken, usersController.processEdit);
router.delete('/:id', authController.requireSignin, authController.logToken, usersController.performDelete);

module.exports = router;