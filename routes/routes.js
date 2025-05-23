// ONLINE-STORE/routes/products.routes.js
const express = require('express');
const router = express.Router();
const { readDB, writeDB, uuidv4 } = require('../utils/dbUtils');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Перегляд всіх продуктів (доступно всім)
// GET /api/products?name=Ноутбук&minPrice=10000&maxPrice=40000
router.get('/', async (req, res) => {
    try {
        const db = await readDB();
        let products = db.products;

        const { name, minPrice, maxPrice } = req.query;

        if (name) {
            products = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
        }
        if (minPrice) {
            products = products.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => p.price <= parseFloat(maxPrice));
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Перегляд одного продукту (доступно всім)
router.get('/:id', async (req, res) => {
    try {
        const db = await readDB();
        const product = db.products.find(p => p.id === req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// --- Маршрути для Адміністратора ---

// Створення продукту (тільки адмін)
router.post('/', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { name, description, price, stockQuantity } = req.body;
    if (!name || !description || price == null || stockQuantity == null) {
        return res.status(400).json({ message: 'All fields are required: name, description, price, stockQuantity' });
    }
    if (typeof price !== 'number' || typeof stockQuantity !== 'number') {
        return res.status(400).json({ message: 'Price and stockQuantity must be numbers' });
    }


    try {
        const db = await readDB();
        const newProduct = {
            id: uuidv4(),
            name,
            description,
            price,
            stockQuantity
        };
        db.products.push(newProduct);
        await writeDB(db);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Оновлення продукту (тільки адмін)
router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { name, description, price, stockQuantity } = req.body;
     if (!name || !description || price == null || stockQuantity == null) {
        return res.status(400).json({ message: 'All fields are required: name, description, price, stockQuantity' });
    }
    if (typeof price !== 'number' || typeof stockQuantity !== 'number') {
        return res.status(400).json({ message: 'Price and stockQuantity must be numbers' });
    }

    try {
        const db = await readDB();
        const productIndex = db.products.findIndex(p => p.id === req.params.id);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        db.products[productIndex] = { ...db.products[productIndex], name, description, price, stockQuantity };
        await writeDB(db);
        res.json(db.products[productIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Видалення продукту (тільки адмін)
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    try {
        const db = await readDB();
        const initialLength = db.products.length;
        db.products = db.products.filter(p => p.id !== req.params.id);

        if (db.products.length === initialLength) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await writeDB(db);
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});


module.exports = router;