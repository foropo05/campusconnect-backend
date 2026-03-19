let express = require('express');
let router = express.Router();

let postsController = require('../controllers/posts');
let authController = require('../controllers/auth');

router.get('/', postsController.postList);
router.get('/:id', postsController.getByID);
router.post('/', authController.requireSignin, authController.logToken, postsController.processAdd);
router.put('/:id', authController.requireSignin, authController.logToken, postsController.processEdit);
router.delete('/:id', authController.requireSignin, authController.logToken, postsController.performDelete);

module.exports = router;