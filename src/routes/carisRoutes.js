const express = require("express");
const router = express.Router();
const db = require("../config/db");


// LIST
router.get("/", (req, res) => {
    db.query("SELECT * FROM caris WHERE active = 0 ORDER BY id DESC",
    (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});


// ADD
router.post("/add", (req, res) => {
    const { type, name, phone, email, address, description } = req.body;

    db.query(
        `INSERT INTO caris (type, name, phone, email, address, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [type, name, phone, email, address, description],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("ok");
        }
    );
});


// UPDATE
router.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { type, name, phone, email, address, description } = req.body;

    db.query(
        `UPDATE caris 
         SET type=?, name=?, phone=?, email=?, address=?, description=? 
         WHERE id=?`,
        [type, name, phone, email, address, description, id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("ok");
        }
    );
});


// DELETE (soft)
router.delete("/delete/:id", (req, res) => {

    db.query(
        "UPDATE caris SET active = 1 WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("ok");
        }
    );
});


module.exports = router;