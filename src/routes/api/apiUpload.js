const express = require('express');
const router = express.Router();
const db = require('../../functions/database');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const randomstring = require('randomstring');
const calculateFolderSize = require('../../functions/calculateFolderSize');
const loadFunctions = require("../../functions/loadFunctions");
const maxFileSize = loadFunctions.config('maxSizePerFileMB') * 1024 * 1024;

router.post('/', (req, res) => {
    const form = new formidable.IncomingForm();
    form.maxFileSize = maxFileSize;
    
    form.parse(req, async (err, fields, files) => {
        try {
            const uploadKey = fields.uploadKey;
            const extension = path.extname(files.file.name).replace(".", "");
            const hash = randomstring.generate(8);
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'];

            if (!allowedExtensions.includes(extension)) {
                return res.status(400).send("Invalid file type.");
            }

            const userQuery = `
                SELECT users.id, users.embed_author, users.domain, users.subdomain, users.embed_title, users.embed_description, users.embed_color, users.embed_url, users.embed_image, users.embed_footer, storage_capacities.capacity AS storage_limit, storage_capacities.name AS storage_name
                FROM users
                LEFT JOIN storage_capacities ON users.storage_capacity_id = storage_capacities.id
                WHERE users.upload_key = ?`;
            db.query(userQuery, [uploadKey], async (err, results) => {
                if (err) {
                    console.error('Error occurred:', err);
                    return res.render('errors/500');
                }

                if (results.length === 0) {
                    return res.status(400).send("Invalid upload key.");
                }

                const user = results[0];
                const userId = user.id;
                const userFolder = path.join(__dirname, `../../uploads/${userId}`);
                const folderSize = await calculateFolderSize(userFolder);
                const storageLimit = user.storage_limit * 1024 * 1024; // Convert to bytes

                if (folderSize + files.file.size > storageLimit) {
                    return res.status(400).send("Storage limit exceeded.");
                }

                const newFilePath = path.join(userFolder, `${hash}.${extension}`);
		fs.copyFile(files.file.path, newFilePath, (err) => {
                    if (err) {
                        console.error('Error occurred:', err);
                        return res.render('errors/500');
                    }
			
		fs.rm(files.file.path, { recursive:false}, (err) => {
			if (err) {
			console.error('Error occurred:', err);
                        return res.render('errors/500');
			}
		});

                    const insertQuery = `
                        INSERT INTO uploads (file_name, user_id, user_name, url, raw_url, embed_title, embed_description, embed_color, embed_url, embed_image, embed_footer, upload_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    const uploadData = [
                        `${hash}.${extension}`,
                        userId,
                        user.embed_author,
                        `http://${user.domain}/uploads/${hash}`,
                        `http://${user.domain}/uploads/${userId}/${hash}.${extension}`,
                        user.embed_title,
                        user.embed_description,
                        user.embed_color,
                        user.embed_url,
                        user.embed_image,
                        user.embed_footer,
                        new Date()
                    ];

                    db.query(insertQuery, uploadData, (insertErr) => {
                        if (insertErr) {
                            console.error('Error occurred:', insertErr);
                            return res.render('errors/500');
                        }

                        const responseUrl = user.subdomain ? `http://${user.subdomain}.${user.domain}/uploads/${hash}` : `http://${user.domain}/uploads/${hash}`;
                        res.write(responseUrl);
                        res.end();
                    });
                });
            });
        } catch (error) {
            console.error('Error occurred:', error);
            return res.render('errors/500');
        }
    });
});

module.exports = router;
