const mysql = require("mysql2");
require("dotenv").config();

// Bağlantı havuzu (Pool) canlı sistemlerde daha sağlıklıdır
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Hata kontrolü
db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL bağlantı hatası:", err.message);
    } else {
        console.log("MySQL Canlı Veritabanına Bağlandı ✅");
        connection.release();
    }
});

module.exports = db.promise(); // Diğer dosyalarda await kullanabilmen için