const express = require('express');
const router = express.Router();
const db = require('../../functions/database');

router.get("/:uploadkey", async (req, res) => {
    try {
        const uploadKey = req.params["uploadkey"];
        const username = uploadKey.split('_')[0];

        const query = `
            SELECT file_name AS filename, raw_url AS rawUrl, url
            FROM uploads
            WHERE user_name = ?
        `;
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.render('errors/500');
            }

            const uploadsList = results.map(upload => ({
                filename: upload.filename,
                rawUrl: upload.rawUrl,
                url: upload.url
            }));

            res.json(uploadsList);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving uploads." });
    }
});

module.exports = router;