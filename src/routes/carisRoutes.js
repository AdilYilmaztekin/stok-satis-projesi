const express = require("express");
const router = express.Router();
const db = require("../config/db");

// LIST - Tüm aktif carileri listele
router.get("/", async (req, res) => {
    try {
        const sql = "SELECT * FROM `caris` WHERE `active` = 0 ORDER BY `id` DESC";
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Cari Listeleme Hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

router.get("/count", async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM `caris` WHERE `active` = 0";
        const [rows] = await db.query(sql);
        res.json(rows[0]);
    } catch (err) {
        console.error("Cari sayısı alınırken hata:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// ADD - Yeni cari ekle
router.post("/add", async (req, res) => {
    const { type, name, phone, email, address, description } = req.body;
    try {
        const sql = `
            INSERT INTO \`caris\` (\`type\`, \`name\`, \`phone\`, \`email\`, \`address\`, \`description\`)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [type, name, phone, email, address, description]);
        res.send("ok");
    } catch (err) {
        console.error("Cari Ekleme Hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// UPDATE - Cari bilgilerini güncelle
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { type, name, phone, email, address, description } = req.body;
    try {
        const sql = `
            UPDATE \`caris\` 
            SET \`type\`=?, \`name\`=?, \`phone\`=?, \`email\`=?, \`address\`=?, \`description\`=? 
            WHERE \`id\`=?
        `;
        await db.query(sql, [type, name, phone, email, address, description, id]);
        res.send("ok");
    } catch (err) {
        console.error("Cari Güncelleme Hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

// DELETE (soft delete) - Cariyi pasife çek
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "UPDATE \`caris\` SET \`active\` = 1 WHERE \`id\` = ?";
        const [result] = await db.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cari bulunamadı" });
        }
        res.send("ok");
    } catch (err) {
        console.error("Cari Silme Hatası:", err);
        res.status(500).json({ message: "Hata oluştu", error: err.message });
    }
});

module.exports = router;