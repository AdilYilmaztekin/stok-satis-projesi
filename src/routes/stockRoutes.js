const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =====================
// STOK LİSTELEME (GET)
// =====================
router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT 
                ps.id,
                p.name AS product_name,
                w.name AS warehouse_name,
                ps.stock,
                ps.created_at
            FROM \`product_stocks\` ps
            INNER JOIN \`products\` p ON ps.product_id = p.id
            INNER JOIN \`warehouses\` w ON ps.warehouse_id = w.id
            WHERE ps.active = 0
            ORDER BY ps.id DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Stok Listeleme Hatası:", err);
        res.status(500).json({ message: "Stoklar listelenirken hata oluştu." });
    }
});

// =====================
// STOK EKLEME (POST)
// =====================
router.post("/add", async (req, res) => {
    const { product_id, warehouse_id, stock } = req.body;

    if (!product_id || !warehouse_id || stock === undefined || stock === null) {
        return res.status(400).json({ message: "Tüm alanları doldurun." });
    }

    try {
        // Aynı ürün o depoda zaten var mı kontrolü
        const checkSql = "SELECT id FROM `product_stocks` WHERE `product_id` = ? AND `warehouse_id` = ? AND `active` = 0";
        const [checkResult] = await db.query(checkSql, [product_id, warehouse_id]);

        if (checkResult.length > 0) {
            return res.status(400).json({ message: "Bu ürün bu depoda zaten kayıtlı." });
        }

        // Yoksa ekle
        const insertSql = "INSERT INTO `product_stocks` (`product_id`, `warehouse_id`, `stock`, `active`) VALUES (?, ?, ?, 0)";
        await db.query(insertSql, [product_id, warehouse_id, stock]);
        
        res.json({ message: "Stok kaydı eklendi." });
    } catch (err) {
        console.error("Stok Ekleme Hatası:", err);
        res.status(500).json({ message: "Stok eklenirken hata oluştu." });
    }
});

// =====================
// TEKİL STOK KAYDI GETİR (GET)
// =====================
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "SELECT id, product_id, warehouse_id, stock FROM `product_stocks` WHERE `id` = ? AND `active` = 0";
        const [result] = await db.query(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Kayıt bulunamadı." });
        }
        res.json(result[0]);
    } catch (err) {
        console.error("Tekil Kayıt Hatası:", err);
        res.status(500).json({ message: "Kayıt alınarken hata oluştu." });
    }
});

// =====================
// STOK GÜNCELLEME (PUT)
// =====================
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { product_id, warehouse_id, stock } = req.body;

    if (!product_id || !warehouse_id || stock === undefined || stock === null) {
        return res.status(400).json({ message: "Tüm alanları doldurun." });
    }

    try {
        // Kendisi dışındaki kayıtlarda aynı ürün/depo ikilisi var mı?
        const checkSql = "SELECT id FROM `product_stocks` WHERE `product_id` = ? AND `warehouse_id` = ? AND `id` != ? AND `active` = 0";
        const [checkResult] = await db.query(checkSql, [product_id, warehouse_id, id]);

        if (checkResult.length > 0) {
            return res.status(400).json({ message: "Bu ürün bu depoda zaten kayıtlı." });
        }

        const updateSql = "UPDATE `product_stocks` SET `product_id` = ?, `warehouse_id` = ?, `stock` = ? WHERE `id` = ? AND `active` = 0";
        await db.query(updateSql, [product_id, warehouse_id, stock, id]);

        res.json({ message: "Stok kaydı güncellendi." });
    } catch (err) {
        console.error("Stok Güncelleme Hatası:", err);
        res.status(500).json({ message: "Güncelleme sırasında hata oluştu." });
    }
});

// =====================
// SİLME (SOFT DELETE - UPDATE)
// =====================
router.put("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "UPDATE `product_stocks` SET `active` = 1 WHERE `id` = ? AND `active` = 0";
        await db.query(sql, [id]);
        res.json({ message: "Stok kaydı silindi." });
    } catch (err) {
        console.error("Stok Silme Hatası:", err);
        res.status(500).json({ message: "Silme sırasında hata oluştu." });
    }
});

module.exports = router;