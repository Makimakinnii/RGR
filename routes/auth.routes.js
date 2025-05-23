// ONLINE-STORE/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB, writeDB, uuidv4 } = require('../utils');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Реєстрація
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const db = await readDB();
    if (db.users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        roles: ['USER'] // За замовчуванням новий користувач - USER
    };
    db.users.push(newUser);
    await writeDB(db);

    // Створюємо токен для нового користувача (опціонально, можна вимагати логін)
    const token = jwt.sign({ id: newUser.id, username: newUser.username, roles: newUser.roles }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token, user: {id: newUser.id, username: newUser.username, roles: newUser.roles} });
});

// Логін
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const db = await readDB();
    const user = db.users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, roles: user.roles }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: {id: user.id, username: user.username, roles: user.roles} });
});

module.exports = router;