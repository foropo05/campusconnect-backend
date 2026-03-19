let express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
  res.json({
    success: true,
    message: 'CampusConnect backend is running.'
  });
});

module.exports = router;