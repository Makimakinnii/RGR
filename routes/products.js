const express = require('express');
const fs = require('fs');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const DB_FILE = './db/database.json';

function getDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

router.post('/', authenticateToken, authorizeRole('admin'), (req, res) => {
  const db = getDB();
  const newProduct = { id: Date.now(), ...req.body };
  db.products.push(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  res.json(db.products);
});

router.get('/search', authenticateToken, (req, res) => {
  const db = getDB();
  const { query } = req.query;
  const results = db.products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  res.json(results);
});

router.put('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const db = getDB();
  const product = db.products.find(p => p.id == req.params.id);
  if (!product) return res.sendStatus(404);
  Object.assign(product, req.body);
  saveDB(db);
  res.json(product);
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const db = getDB();
  db.products = db.products.filter(p => p.id != req.params.id);
  saveDB(db);
  res.sendStatus(204);
});

module.exports = router;