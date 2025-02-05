const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../functions/database');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('authentication/register');
});

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const registrationDate = new Date();

  const query = 'INSERT INTO `users` (username, email, password, registration_date) VALUES (?, ?, ?, ?)';
  db.query(query, [username, email, hashedPassword, registrationDate], (err) => {
    if (err) {
      console.error('Error occurred:', err);
      return res.render('errors/500');
    }
    res.redirect('/login');
  });
});

module.exports = router;