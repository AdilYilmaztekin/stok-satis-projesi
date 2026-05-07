const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =====================
// SATIŞLARI LİSTELEME (GET)
// =====================
router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT 
                s.id, s.sale_date, s.total_amount, s.active,
                c.name AS cari_name, w.name AS warehouse_name
            FROM \`sales\` s
            LEFT JOIN \`caris\` c ON s.cari_id = c.id
            LEFT JOIN \`warehouses\` w ON s.warehouse_id = w.id
            WHERE s.active = 0
            ORDER BY s.id DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Satış listeleme hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// =====================
// TEKİL SATIŞ DETAYI (GET)
// =====================
router.get("/:id", async (req, res) => {
    try {
        const saleId = req.params.id;
        const [saleResult] = await db.query("SELECT * FROM `sales` WHERE `id` = ?", [saleId]);
        
        if (saleResult.length === 0) return res.status(404).json({ message: "Satış bulunamadı" });

        const [itemsResult] = await db.query("SELECT * FROM `sale_items` WHERE `sale_id` = ?", [saleId]);
        
        res.json({
            ...saleResult[0],
            items: itemsResult
        });
    } catch (err) {
        console.error("Satış detayı hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// =====================
// YENİ SATIŞ EKLEME (POST)
// =====================
router.post("/", async (req, res) => {
    try {
        const { sale_date, cari_id, warehouse_id, total_amount, description, items } = req.body;

        // 1. Satış Başlığını Ekle
        const saleSql = "INSERT INTO `sales` (`sale_date`, `cari_id`, `warehouse_id`, `total_amount`, `description`, `active`) VALUES (?, ?, ?, ?, ?, 0)";
        const [result] = await db.query(saleSql, [sale_date, cari_id, warehouse_id, total_amount, description]);
        const saleId = result.insertId;

        if (items && items.length > 0) {
            // 2. Satış Kalemlerini Ekle
            const itemSql = "INSERT INTO `sale_items` (`sale_id`, `product_id`, `quantity`, `unit_price`, `total_price`) VALUES ?";
            const values = items.map(i => [saleId, i.product_id, i.quantity, i.unit_price, i.total_price]);
            await db.query(itemSql, [values]);

            // 3. Stokları Düş
            for (let i of items) {
                await db.query("UPDATE `product_stocks` SET `stock` = `stock` - ? WHERE `product_id` = ? AND `warehouse_id` = ?", 
                    [i.quantity, i.product_id, warehouse_id]);
            }
        }

        res.json({ success: true, message: "Satış başarıyla eklendi" });
    } catch (err) {
        console.error("Satış ekleme hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// =====================
// SATIŞ GÜNCELLEME (PUT)
// =====================
router.put("/:id", async (req, res) => {
    try {
        const saleId = req.params.id;
        const { sale_date, cari_id, warehouse_id, total_amount, description, items } = req.body;

        // 1. Önce eski kalemleri al (Stok iadesi için)
        const [oldItems] = await db.query("SELECT * FROM `sale_items` WHERE `sale_id` = ?", [saleId]);

        // 2. Eski stokları iade et
        for (let item of oldItems) {
            await db.query("UPDATE `product_stocks` SET `stock` = `stock` + ? WHERE `product_id` = ? AND `warehouse_id` = ?", 
                [item.quantity, item.product_id, warehouse_id]);
        }

        // 3. Eski kalemleri sil
        await db.query("DELETE FROM `sale_items` WHERE `sale_id` = ?", [saleId]);

        // 4. Satış başlığını güncelle
        const updateSql = "UPDATE `sales` SET `sale_date` = ?, `cari_id` = ?, `warehouse_id` = ?, `total_amount` = ?, `description` = ? WHERE `id` = ?";
        await db.query(updateSql, [sale_date, cari_id, warehouse_id, total_amount, description, saleId]);

        // 5. Yeni kalemleri ekle ve stokları tekrar düş
        if (items && items.length > 0) {
            const itemSql = "INSERT INTO `sale_items` (`sale_id`, `product_id`, `quantity`, `unit_price`, `total_price`) VALUES ?";
            const values = items.map(i => [saleId, i.product_id, i.quantity, i.unit_price, i.total_price]);
            await db.query(itemSql, [values]);

            for (let i of items) {
                await db.query("UPDATE `product_stocks` SET `stock` = `stock` - ? WHERE `product_id` = ? AND `warehouse_id` = ?", 
                    [i.quantity, i.product_id, warehouse_id]);
            }
        }

        res.json({ success: true, message: "Satış başarıyla güncellendi" });
    } catch (err) {
        console.error("Satış güncelleme hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// =====================
// SATIŞ SİLME (DELETE)
// =====================
router.delete("/:id", async (req, res) => {
    try {
        const saleId = req.params.id;

        // Stokları iade etmek için kalemleri ve depo bilgisini al
        const [items] = await db.query("SELECT * FROM `sale_items` WHERE `sale_id` = ?", [saleId]);
        const [sale] = await db.query("SELECT `warehouse_id` FROM `sales` WHERE `id` = ?", [saleId]);

        if (sale.length > 0) {
            const wId = sale[0].warehouse_id;
            for (let i of items) {
                await db.query("UPDATE `product_stocks` SET `stock` = `stock` + ? WHERE `product_id` = ? AND `warehouse_id` = ?", 
                    [i.quantity, i.product_id, wId]);
            }
        }

        // Soft delete
        await db.query("UPDATE `sales` SET `active` = 1 WHERE `id` = ?", [saleId]);
        res.json({ success: true, message: "Satış silindi ve stoklar iade edildi" });

    } catch (err) {
        console.error("Satış silme hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

module.exports = router;