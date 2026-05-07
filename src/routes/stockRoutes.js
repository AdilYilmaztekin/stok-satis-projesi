const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Stok ekleme
router.post("/add", (req, res) => {
    const { product_id, warehouse_id, stock } = req.body;

    if (!product_id || !warehouse_id || stock === undefined || stock === null) {
        return res.status(400).json({ message: "Tüm alanları doldurun." });
    }

    const checkSql = `
        SELECT id 
        FROM product_stocks 
        WHERE product_id = ? AND warehouse_id = ? AND active = 0
    `;

    db.query(checkSql, [product_id, warehouse_id], (checkErr, checkResult) => {
        if (checkErr) {
            console.log(checkErr);
            return res.status(500).json({ message: "Kontrol sırasında hata oluştu." });
        }

        if (checkResult.length > 0) {
            return res.status(400).json({ message: "Bu ürün bu depoda zaten kayıtlı." });
        }

        const insertSql = `
            INSERT INTO product_stocks (product_id, warehouse_id, stock, active)
            VALUES (?, ?, ?, 0)
        `;

        db.query(insertSql, [product_id, warehouse_id, stock], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Stok eklenirken hata oluştu." });
            }

            res.json({ message: "Stok kaydı eklendi." });
        });
    });
});

// Stok listeleme
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            ps.id,
            p.name AS product_name,
            w.name AS warehouse_name,
            ps.stock,
            ps.created_at
        FROM product_stocks ps
        INNER JOIN products p ON ps.product_id = p.id
        INNER JOIN warehouses w ON ps.warehouse_id = w.id
        WHERE ps.active = 0
        ORDER BY ps.id DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Stoklar listelenirken hata oluştu." });
        }

        res.json(result);
    });
});

// Tek stok kaydı getir
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT id, product_id, warehouse_id, stock
        FROM product_stocks
        WHERE id = ? AND active = 0
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Kayıt alınırken hata oluştu." });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Kayıt bulunamadı." });
        }

        res.json(result[0]);
    });
});

// Stok güncelleme
router.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { product_id, warehouse_id, stock } = req.body;

    if (!product_id || !warehouse_id || stock === undefined || stock === null) {
        return res.status(400).json({ message: "Tüm alanları doldurun." });
    }

    const checkSql = `
        SELECT id
        FROM product_stocks
        WHERE product_id = ? AND warehouse_id = ? AND id != ? AND active = 0
    `;

    db.query(checkSql, [product_id, warehouse_id, id], (checkErr, checkResult) => {
        if (checkErr) {
            console.log(checkErr);
            return res.status(500).json({ message: "Kontrol sırasında hata oluştu." });
        }

        if (checkResult.length > 0) {
            return res.status(400).json({ message: "Bu ürün bu depoda zaten kayıtlı." });
        }

        const updateSql = `
            UPDATE product_stocks
            SET product_id = ?, warehouse_id = ?, stock = ?
            WHERE id = ? AND active = 0
        `;

        db.query(updateSql, [product_id, warehouse_id, stock, id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Güncelleme sırasında hata oluştu." });
            }

            res.json({ message: "Stok kaydı güncellendi." });
        });
    });
});

// Soft delete
router.put("/delete/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE product_stocks
        SET active = 1
        WHERE id = ? AND active = 0
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Silme sırasında hata oluştu." });
        }

        res.json({ message: "Stok kaydı silindi." });
    });
});

module.exports = router;