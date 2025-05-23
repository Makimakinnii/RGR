// ONLINE-STORE/routes/orders.routes.js
const express = require('express');
const router = express.Router();
const { readDB, writeDB, uuidv4 } = require('../utils');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Створення замовлення (авторизований користувач)
router.post('/', authenticateToken, authorizeRole(['USER', 'ADMIN']), async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Valid productId and positive quantity are required' });
    }

    try {
        const db = await readDB();
        const product = db.products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        const newOrder = {
            id: uuidv4(),
            userId: req.user.id, // З токена
            productId,
            quantity,
            orderDate: new Date().toISOString(),
            status: 'PENDING'
        };

        // Оновлюємо кількість товару на складі
        product.stockQuantity -= quantity;

        db.orders.push(newOrder);
        await writeDB(db);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Перегляд своїх замовлень (авторизований користувач)
router.get('/my', authenticateToken, authorizeRole(['USER', 'ADMIN']), async (req, res) => {
    try {
        const db = await readDB();
        const userOrders = db.orders.filter(order => order.userId === req.user.id);
        res.json(userOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user orders', error: error.message });
    }
});

// --- Маршрути для Адміністратора ---

// Перегляд всіх замовлень (тільки адмін)
// GET /api/orders/admin?userId=...&status=PENDING
router.get('/admin', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    try {
        const db = await readDB();
        let orders = db.orders;
        const { userId, status } = req.query;

        if (userId) {
            orders = orders.filter(o => o.userId === userId);
        }
        if (status) {
            orders = orders.filter(o => o.status.toUpperCase() === status.toUpperCase());
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders', error: error.message });
    }
});

// Оновлення статусу замовлення (тільки адмін)
router.put('/admin/:orderId/status', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body; // Наприклад: "COMPLETED", "CANCELED"
    if (!status) {
        return res.status(400).json({ message: 'New status is required' });
    }
    // Можна додати валідацію на допустимі статуси

    try {
        const db = await readDB();
        const orderIndex = db.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }
        db.orders[orderIndex].status = status;
        await writeDB(db);
        res.json(db.orders[orderIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

// (Опціонально) Видалення замовлення адміном
router.delete('/admin/:orderId', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    try {
        const db = await readDB();
        const initialLength = db.orders.length;
        db.orders = db.orders.filter(o => o.id !== req.params.orderId);

        if (db.orders.length === initialLength) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await writeDB(db);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});


module.exports = router;