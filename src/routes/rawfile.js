const fs = require('fs');
const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../functions/database');

router.get("/:file", (req, res) => {
    const file = req.params["file"];
    const query = 'SELECT * FROM `uploads` WHERE file_name = ?';
    db.query(query, [file], (err, results) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.render('errors/500');
        }

        if (results.length === 0) {
            return res.status(404).send('File not found');
        }

        const upload = results[0];
        const userId = upload.user_id;
        const fileName = upload.file_name;
        const userDirectory = path.join(__dirname, `../uploads/${userId}`);
        const filePath = path.join(userDirectory, fileName);

        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        } else {
            return res.status(404).send("File not found.");
        }
    });
});

module.exports = router;
