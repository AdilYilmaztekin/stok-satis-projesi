const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Depo ekleme
router.post("/add", (req, res) => {
    const { name, location } = req.body;

    const sql = "INSERT INTO warehouses (name, location) VALUES (?, ?)";

    db.query(sql, [name, location], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Depo eklenirken hata oluştu");
        }

        res.send("Depo eklendi ");
    });
});

// Aktif depoları listeleme
router.get("/", (req, res) => {
    const sql = "SELECT * FROM warehouses WHERE active = 0 ORDER BY id DESC";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Depolar listelenirken hata oluştu");
        }

        res.json(result);
    });
});

// Depo güncelleme
router.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;

    const sql = "UPDATE warehouses SET name = ?, location = ? WHERE id = ?";

    db.query(sql, [name, location, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Depo güncellenirken hata oluştu");
        }

        res.send("Depo güncellendi ");
    });
});

// Depo silme (soft delete)
router.delete("/delete/:id", (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE warehouses SET active = 1 WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Depo silinirken hata oluştu");
        }

        res.send("Depo silindi. ");
    });
});

module.exports = router;