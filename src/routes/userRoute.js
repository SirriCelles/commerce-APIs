const router = require('express').Router();
const auth = require('../controllers/authController');
const userController = require('../controllers/userController');

router.patch('/updateMe', auth.protect, userController.updateMe);

module.exports = router;
