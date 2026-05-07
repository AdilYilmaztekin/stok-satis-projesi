const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

const pool = mysql.createPool(dbConfig);

// Bağlantıyı manuel test et ve hatayı detaylı yazdır
const poolPromise = pool.promise();

async function testConnection() {
    try {
        const connection = await poolPromise.getConnection();
        console.log('MySQL bağlantısı nihayet BAŞARILI! 🚀');
        connection.release();
    } catch (err) {
        console.error('Bağlantı denemesi başarısız. Detay:', {
            mesaj: err.message,
            kod: err.code,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        });
    }
}

testConnection();

module.exports = poolPromise;