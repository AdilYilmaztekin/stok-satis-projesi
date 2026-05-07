const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =====================
// DEPO EKLEME (POST)
// =====================
router.post("/add", async (req, res) => {
    const { name, location } = req.body;
    try {
        const sql = "INSERT INTO `warehouses` (`name`, `location`, `active`) VALUES (?, ?, 0)";
        await db.query(sql, [name, location]);
        res.send("Depo eklendi");
    } catch (err) {
        console.error("Depo Ekleme Hatası:", err);
        res.status(500).send("Depo eklenirken hata oluştu");
    }
});

// =====================
// AKTİF DEPOLARI LİSTELEME (GET)
// =====================
router.get("/", async (req, res) => {
    try {
        const sql = "SELECT * FROM `warehouses` WHERE `active` = 0 ORDER BY `id` DESC";
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Depo Listeleme Hatası:", err);
        res.status(500).send("Depolar listelenirken hata oluştu");
    }
});

// =====================
// DEPO GÜNCELLEME (PUT)
// =====================
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    try {
        const sql = "UPDATE `warehouses` SET `name` = ?, `location` = ? WHERE `id` = ? AND `active` = 0";
        await db.query(sql, [name, location, id]);
        res.send("Depo güncellendi");
    } catch (err) {
        console.error("Depo Güncelleme Hatası:", err);
        res.status(500).send("Depo güncellenirken hata oluştu");
    }
});

// =====================
// DEPO SİLME (SOFT DELETE)
// =====================
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "UPDATE `warehouses` SET `active` = 1 WHERE `id` = ?";
        const [result] = await db.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).send("Depo bulunamadı");
        }
        res.send("Depo silindi.");
    } catch (err) {
        console.error("Depo Silme Hatası:", err);
        res.status(500).send("Depo silinirken hata oluştu");
    }
});

module.exports = router;