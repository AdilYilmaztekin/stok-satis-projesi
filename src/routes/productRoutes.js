const express = require("express");
const router = express.Router();
const db = require("../config/db"); // db burada senin attığın poolPromise dosyası

// Ürün ekleme
router.post("/add", async (req, res) => {
    const { name, price } = req.body;
    try {
        const sql = "INSERT INTO `products` (`name`, `price`) VALUES (?, ?)";
        await db.query(sql, [name, price]);
        res.send("Ürün eklendi");
    } catch (err) {
        console.error("Ekleme Hatası:", err);
        res.status(500).send("Hata oluştu");
    }
});

// Ürün listeleme
router.get("/", async (req, res) => {
    try {
        const sql = "SELECT id, name, price, created_at FROM `products` WHERE `active` = 0 ORDER BY id DESC";
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Listeleme Hatası:", err);
        res.status(500).json({ message: "Hata oluştu" });
    }
});

// Son 5 ürün
router.get("/latest", async (req, res) => {
    try {
        const sql = "SELECT id, name, price, created_at FROM `products` WHERE `active` = 0 ORDER BY id DESC LIMIT 5";
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Latest Hatası:", err);
        res.status(500).json({ message: "Hata oluştu" });
    }
});

// Toplam aktif ürün sayısı
router.get("/count", async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM `products` WHERE `active` = 0";
        const [rows] = await db.query(sql);
        res.json(rows[0]);
    } catch (err) {
        console.error("Count Hatası:", err);
        res.status(500).json({ message: "Hata oluştu" });
    }
});

// Ürün güncelleme
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    try {
        const sql = "UPDATE `products` SET `name` = ?, `price` = ? WHERE `id` = ?";
        await db.query(sql, [name, price, id]);
        res.send("Ürün güncellendi");
    } catch (err) {
        console.error("Güncelleme Hatası:", err);
        res.status(500).send("Hata oluştu");
    }
});

// Ürün silme (soft delete)
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "UPDATE `products` SET `active` = 1 WHERE `id` = ?";
        const [result] = await db.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }
        res.json({ message: "Ürün silindi." });
    } catch (err) {
        console.error("Silme Hatası:", err);
        res.status(500).json({ message: "Hata oluştu" });
    }
});

// sales sayfası için
router.get("/warehouse/:id", async (req, res) => {
    const warehouseId = req.params.id;
    try {
        const sql = `
            SELECT 
                p.id AS product_id,
                p.name,
                p.price AS cost_price,                p.created_at,                ps.stock
            FROM \`product_stocks\` ps
            INNER JOIN \`products\` p ON p.id = ps.product_id
            WHERE ps.warehouse_id = ? AND p.active = 0
        `;
        const [rows] = await db.query(sql, [warehouseId]);
        res.json(rows);
    } catch (err) {
        console.error("Depo Stok Hatası:", err);
        res.status(500).json({ message: "Hata oluştu" });
    }
});

module.exports = router;