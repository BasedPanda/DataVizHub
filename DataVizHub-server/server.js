const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your_jwt_secret';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// User registration
app.post('/api/users/register', (req, res) => {
    const { email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Server error');

        // Insert user into the database
        const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(sql, [email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send({ message: 'User already exists' });
                } else {
                    return res.status(500).send('Server error');
                }
            }
            res.send({ message: 'User registered successfully' });
        });
    });
});

// User login
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).send('Server error');

        if (results.length === 0) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare the password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send('Server error');

            if (!isMatch) {
                return res.status(400).send({ message: 'Invalid email or password' });
            }

            // Create a token
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

            res.send({ token });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
