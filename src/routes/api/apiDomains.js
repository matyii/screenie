const express = require('express');
const router = express.Router();
const db = require('../../functions/database');

router.get("/", (req, res) => {
    const query = 'SELECT * FROM `domains`';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: "An error occurred while retrieving domains." });
        }

        res.json(results);
    });
});

module.exports = router;