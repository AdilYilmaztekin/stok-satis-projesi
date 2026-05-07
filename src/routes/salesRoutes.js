const express = require("express");
const router = express.Router();
const db = require("../config/db");
const util = require('util');

// Veritabanı sorgularını asenkron yapıda bekletebilmek için promisify kullanıyoruz.
const query = util.promisify(db.query).bind(db);

// =====================
// SATIŞLARI LİSTELEME (GET)
// =====================
router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT 
                s.id, s.sale_date, s.total_amount, s.active,
                c.name AS cari_name, w.name AS warehouse_name
            FROM sales s
            LEFT JOIN caris c ON s.cari_id = c.id
            LEFT JOIN warehouses w ON s.warehouse_id = w.id
            WHERE s.active = 0
            ORDER BY s.id DESC
        `;
        const result = await query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// TEKİL SATIŞ DETAYI (GET - Düzenleme İçin)
// =====================
router.get("/:id", async (req, res) => {
    try {
        const saleId = req.params.id;
        const saleResult = await query("SELECT * FROM sales WHERE id = ?", [saleId]);
        
        if (saleResult.length === 0) return res.status(404).json({ message: "Satış bulunamadı" });

        const itemsResult = await query("SELECT * FROM sale_items WHERE sale_id = ?", [saleId]);
        
        res.json({
            ...saleResult[0],
            items: itemsResult
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// YENİ SATIŞ EKLEME (POST)
// =====================
router.post("/", async (req, res) => {
    try {
        const { sale_date, cari_id, warehouse_id, total_amount, description, items } = req.body;

        // 1. Satış Başlığını Ekle
        const saleSql = "INSERT INTO sales (sale_date, cari_id, warehouse_id, total_amount, description, active) VALUES (?, ?, ?, ?, ?, 0)";
        const result = await query(saleSql, [sale_date, cari_id, warehouse_id, total_amount, description]);
        const saleId = result.insertId;

        if (items && items.length > 0) {
            // 2. Satış Kalemlerini Ekle
            const itemSql = "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES ?";
            const values = items.map(i => [saleId, i.product_id, i.quantity, i.unit_price, i.total_price]);
            await query(itemSql, [values]);

            // 3. Stokları Düş
            for (let i of items) {
                await query("UPDATE product_stocks SET stock = stock - ? WHERE product_id = ? AND warehouse_id = ?", 
                    [i.quantity, i.product_id, warehouse_id]);
            }
        }

        res.json({ success: true, message: "Satış başarıyla eklendi" });
    } catch (err) {
        console.error("Satış ekleme hatası:", err);
        res.status(500).json(err);
    }
});

// =====================
// SATIŞ GÜNCELLEME (PUT) - TAMAMEN ASENKRON GÜVENLİ YAPI
// =====================
router.put("/:id", async (req, res) => {
    try {
        const saleId = req.params.id;
        const { sale_date, cari_id, warehouse_id, total_amount, description, items } = req.body;

        // 1. Önce eski kalemleri al
        const oldItems = await query("SELECT * FROM sale_items WHERE sale_id = ?", [saleId]);

        // 2. Eski stokları eksiksiz bir şekilde iade et (Bekleyerek)
        for (let item of oldItems) {
            await query("UPDATE product_stocks SET stock = stock + ? WHERE product_id = ? AND warehouse_id = ?", 
                [item.quantity, item.product_id, warehouse_id]);
        }

        // 3. Eski kalemleri sil
        await query("DELETE FROM sale_items WHERE sale_id = ?", [saleId]);

        // 4. Satış başlığını güncelle
        const updateSql = "UPDATE sales SET sale_date = ?, cari_id = ?, warehouse_id = ?, total_amount = ?, description = ? WHERE id = ?";
        await query(updateSql, [sale_date, cari_id, warehouse_id, total_amount, description, saleId]);

        // 5. Yeni kalemleri ekle ve yeni stokları düş
        if (items && items.length > 0) {
            const itemSql = "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES ?";
            const values = items.map(i => [saleId, i.product_id, i.quantity, i.unit_price, i.total_price]);
            await query(itemSql, [values]);

            for (let i of items) {
                await query("UPDATE product_stocks SET stock = stock - ? WHERE product_id = ? AND warehouse_id = ?", 
                    [i.quantity, i.product_id, warehouse_id]);
            }
        }

        res.json({ success: true, message: "Satış başarıyla güncellendi" });
    } catch (err) {
        console.error("Satış güncelleme hatası:", err);
        res.status(500).json(err);
    }
});

// =====================
// SATIŞ SİLME (DELETE - Soft Delete)
// =====================
router.delete("/:id", async (req, res) => {
    try {
        const saleId = req.params.id;

        // Stokları geri yüklemek için önce kalemleri al
        const items = await query("SELECT * FROM sale_items WHERE sale_id = ?", [saleId]);

        // Stokları iade et
        for (let i of items) {
            // Silerken deponun id'sini bilmediğimiz için (veya sales tablosundan joinle almadığımız için)
            // sadece product_id üzerinden iade edemeyiz, satışı bulup deponun idsini alalım:
            const sale = await query("SELECT warehouse_id FROM sales WHERE id = ?", [saleId]);
            if (sale.length > 0) {
                const wId = sale[0].warehouse_id;
                await query("UPDATE product_stocks SET stock = stock + ? WHERE product_id = ? AND warehouse_id = ?", 
                    [i.quantity, i.product_id, wId]);
            }
        }

        // Soft delete: active = 1 yap
        await query("UPDATE sales SET active = 1 WHERE id = ?", [saleId]);
        res.json({ success: true, message: "Satış silindi ve stoklar iade edildi" });

    } catch (err) {
        console.error("Satış silme hatası:", err);
        res.status(500).json(err);
    }
});

module.exports = router;