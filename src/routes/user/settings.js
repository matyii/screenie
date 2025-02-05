const express = require('express');
const passport = require('passport');
const router = express.Router();
const { isAuthenticated } = require('../../functions/auth');

router.get('/', isAuthenticated, (req, res) => {
  res.render('user/settings');
});

module.exports = router;