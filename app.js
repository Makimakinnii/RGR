// ONLINE-STORE/app.js
const express = require('express');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Спочатку налаштовуємо роздачу статичних файлів
app.use(express.static(path.join(__dirname, 'public')));

// 2. Потім підключаємо API маршрути
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 3. Обробник для кореневого шляху (/) - тепер він буде викликатися,
// тільки якщо express.static не знайде index.html в папці public
// Цей обробник можна ЗАКОМЕНТУВАТИ або ВИДАЛИТИ, якщо ви хочете,
// щоб / завжди показував index.html з папки public
/*
app.get('/', (req, res) => {
    res.send('Online Store API is running!');
});
*/

// Простий обробник помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});