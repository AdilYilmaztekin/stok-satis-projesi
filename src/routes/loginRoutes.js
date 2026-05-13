const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// POST isteğini controller'daki fonksiyona gönder
router.post('/', loginController.loginUser);

module.exports = router;