const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

// Register a new user
router.post('/register', usersController.register);

// Login an existing user
router.post('/login', usersController.login);

module.exports = router;
