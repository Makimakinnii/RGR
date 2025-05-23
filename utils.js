// ONLINE-STORE/utils/dbUtils.js
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Для генерації ID

const dbPath = path.join(__dirname, '..', 'db', 'database.json');

async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        // Повертаємо порожню структуру, якщо файл не існує або пошкоджений
        return { users: [], products: [], orders: [] };
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to database:", error);
    }
}

module.exports = {
    readDB,
    writeDB,
    uuidv4
};