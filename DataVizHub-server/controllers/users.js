const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
  const { email, password } = req.body;
  User.create(email, password, (result) => {
    res.json({ message: 'User registered successfully' });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, (user) => {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign({ id: user.id }, '9dd9bb9d33b02eaa8e48771040dd66e1b2ba26deb1281becd729b7db64c9c66615896556c5be42b1bf5be5ce07a2b480196f1422b3ca047aae2d5040a8fd9f49', { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(400).json({ message: 'Incorrect password' });
      }
    });
  });
};
