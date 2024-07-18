const db = require('../configuration1/db');
const bcrypt = require('bcryptjs');

const User = {};

User.create = (email, password, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.query(sql, [email, hash], (err, result) => {
        if (err) throw err;
        callback(result);
      });
    });
  });
};

User.findByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) throw err;
    callback(result[0]);
  });
};

module.exports = User;
