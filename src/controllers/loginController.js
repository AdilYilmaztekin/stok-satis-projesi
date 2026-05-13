const db = require('../config/db'); // Bu artık bir pool.promise() nesnesi

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    console.log("--- Giriş Süreci Başladı ---");
    console.log("1. Gelen Veri:", { username, password });

    try {
        // 2. Sorgu gönderiliyor (await kullanarak)
        console.log("2. Veritabanına sorgu gönderiliyor...");
        
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        
        // db artık promise() olduğu için await kullanıyoruz
        const [results] = await db.query(query, [username, password]);

        // 3. Veritabanından cevap geldi
        console.log("3. Veritabanından cevap geldi. Satır sayısı:", results.length);

        if (results.length > 0) {
            console.log("✅ Giriş Başarılı: ", results[0].username);
            return res.json({ 
                success: true, 
                message: 'Giriş Başarılı! Hoş geldin, ' + results[0].username 
            });
        } else {
            console.log("❌ Giriş Başarısız: Kullanıcı adı veya şifre hatalı.");
            return res.json({ 
                success: false, 
                message: 'Kullanıcı adı veya şifre hatalı!' 
            });
        }

    } catch (err) {
        // 4. Hata yakalama
        console.error("❌ SORGU HATASI:", err);
        return res.status(500).json({ 
            success: false, 
            message: 'Sunucu tarafında veritabanı hatası oluştu!',
            error: err.message 
        });
    }
};