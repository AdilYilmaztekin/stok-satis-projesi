const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Railway ve Render arasındaki mesafe için bu 3 satır ÇOK önemli:
  connectTimeout: 20000, 
  acquireTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Bağlantıyı test eden bir blok (Loglarda görmek için)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL bağlantı hatası:', err.message);
  } else {
    console.log('MySQL Canlı Veritabanına Başarıyla Bağlandı! ✅');
    connection.release();
  }
});

module.exports = pool.promise();