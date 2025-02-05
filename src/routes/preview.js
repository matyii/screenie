const fs = require('fs');
const mainDomain = require('../functions/config.js')('maindomain');
const filesizejs = require('filesize');
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../functions/database');

router.get("/:file", (req, res) => {
    const file = req.params["file"];
    const query = 'SELECT * FROM `uploads` WHERE file_name LIKE ?';
    db.query(query, [`${file}.%`], (err, results) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.render('errors/500');
        }

        if (results.length === 0) {
            return res.status(404).render('errors/404');
        }

        const upload = results[0];
        const userId = upload.user_id;
        const username = upload.user_name;
        const extension = path.extname(upload.file_name).replace(".", "");
        const userDirectory = `./src/uploads/${userId}`;
        const filePath = path.join(userDirectory, upload.file_name);
        const fileUrl = `/uploads/${userId}/${upload.file_name}`;
        const fileSize = filesizejs(fs.statSync(filePath).size, { base: 10 });
        const embedTitle = (upload.embed_title || '')
            .replace("{filename}", file)
            .replace("{filesize}", fileSize)
            .replace("{username}", username);
        const embedDescription = (upload.embed_description || '')
            .replace("{filename}", file)
            .replace("{filesize}", fileSize)
            .replace("{username}", username);
        const embedColor = upload.embed_color || '#000000';

        
        const userQuery = 'SELECT vanityURL FROM `users` WHERE username = ?';
        db.query(userQuery, [username], (userErr, userResults) => {
            if (userErr) {
                console.error('Error occurred:', userErr);
                return res.render('errors/500');
            }

            const vanityURL = userResults.length > 0 ? userResults[0].vanityURL : null;

            if (["webm", "mp4", "mov"].includes(extension)) {
                res.render('previews/video', {
                    item: upload.file_name,
                    file: file,
                    fileSize: fileSize,
                    fileUrl: fileUrl,
                    filePath: filePath,
                    embedTitle: embedTitle,
                    embedDescription: embedDescription,
                    embedColor: embedColor,
                    user: username,
                    vanityURL: vanityURL
                });
            } else {
                res.render('previews/photo', {
                    item: upload.file_name,
                    file: file,
                    fileSize: fileSize,
                    fileUrl: fileUrl,
                    filePath: filePath,
                    embedTitle: embedTitle,
                    embedDescription: embedDescription,
                    embedColor: embedColor,
                    user: username,
                    vanityURL: vanityURL
                });
            }
        });
    });
});

module.exports = router;