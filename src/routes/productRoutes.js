const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Ürün ekleme
router.post("/add", (req, res) => {
    const { name, price } = req.body;

    const sql = "INSERT INTO products (name, price) VALUES (?, ?)";

    db.query(sql, [name, price], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Hata oluştu");
        }

        res.send("Ürün eklendi ");
    });
});

// Ürün listeleme
router.get("/", (req, res) => {
    const sql = "SELECT id, name, price, created_at FROM products WHERE active = 0 ORDER BY id DESC";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Hata oluştu" });
        }

        res.json(result);
    });
});

// Son 5 ürün
router.get("/latest", (req, res) => {
    const sql = `
        SELECT id, name, price, created_at
        FROM products
        WHERE active = 0
        ORDER BY id DESC
        LIMIT 5
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Hata oluştu" });
        }

        res.json(result);
    });
});

// Toplam aktif ürün sayısı
router.get("/count", (req, res) => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM products
        WHERE active = 0
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Hata oluştu" });
        }

        res.json(result[0]);
    });
});

// Ürün güncelleme
router.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    const sql = "UPDATE products SET name = ?, price = ? WHERE id = ?";

    db.query(sql, [name, price, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Hata oluştu");
        }

        res.send("Ürün güncellendi ");
    });
});

// Ürün silme (soft delete)
router.delete("/delete/:id", (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE products SET active = 1 WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Hata oluştu" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }

        res.json({ message: "Ürün silindi." });
    });
});



// sales sayfası için
router.get("/warehouse/:id", (req, res) => {

    const warehouseId = req.params.id;

    const sql = `
        SELECT 
            p.id AS product_id,
            p.name,
            ps.stock
        FROM product_stocks ps
        INNER JOIN products p ON p.id = ps.product_id
        WHERE ps.warehouse_id = ? AND p.active = 0
    `;

    db.query(sql, [warehouseId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Hata oluştu" });
        }

        res.json(result);
    });
});

module.exports = router;