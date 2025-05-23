// generateHashes.js
const bcrypt = require('bcryptjs'); // Імпортуємо бібліотеку для хешування

async function generate() {
    const adminPassword = 'adminpass'; // Пароль, який ми хочемо хешувати для адміна
    const userPassword = 'userpass';   // Пароль, який ми хочемо хешувати для користувача

    const saltRounds = 10; // "Сіль" - кількість раундів хешування, робить хеш стійкішим

    // Асинхронно хешуємо пароль адміна
    const adminHash = await bcrypt.hash(adminPassword, saltRounds);
    // Асинхронно хешуємо пароль користувача
    const userHash = await bcrypt.hash(userPassword, saltRounds);

    // Виводимо результати в консоль
    console.log(`Admin ('${adminPassword}') hash: ${adminHash}`);
    console.log(`User ('${userPassword}') hash: ${userHash}`);
}

generate(); // Запускаємо функцію генерації