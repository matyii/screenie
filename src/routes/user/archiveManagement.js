const fs = require('fs');
const path = require('path');
const express = require('express');
const archiver = require('archiver');
const router = express.Router();
const db = require('../../functions/database');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

router.post("/download-uploads", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;

        const keysQuery = 'SELECT * FROM `users` WHERE id = ?';
        db.query(keysQuery, [userId], (err, results) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.render('errors/500');
            }

            if (results.length === 0) {
                return res.status(400).json({ success: false, message: 'User ID not found' });
            }

            const user = results[0];
            const uid = user.id;
            const userFolder = path.join(__dirname, `../../uploads/${uid}`);
            const archiveFolder = path.join(__dirname, `../../archives`);

            if (!fs.existsSync(archiveFolder)) {
                fs.mkdirSync(archiveFolder, { recursive: true });
            }

            const now = new Date();
            const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            const archiveName = `${uid}_${formattedDate}.zip`;
            const archivePath = path.join(archiveFolder, archiveName);

            const output = fs.createWriteStream(archivePath);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            output.on('close', async () => {
                const insertQuery = 'INSERT INTO `archives` (file_name, user_id, created_at, valid) VALUES (?, ?, ?, ?)';
                const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // Convert to 'YYYY-MM-DD HH:MM:SS'
                const archiveData = [
                    archiveName,
                    uid,
                    createdAt,
                    true
                ];

                db.query(insertQuery, archiveData, (insertErr) => {
                    if (insertErr) {
                        console.error('Error occurred:', insertErr);
                        return res.render('errors/500');
                    }

                    res.json({ success: true, archivePath: `/dashboard/archives/download-archive/${archiveName}` });
                });
            });

            archive.on('error', (err) => {
                throw err;
            });

            archive.pipe(output);
            archive.directory(userFolder, false);
            archive.finalize();
        });
    } catch (error) {
        console.error('Error creating archive:', error);
        return res.render('errors/500');
    }
});

router.get("/download-archive/:archiveName", isAuthenticated, (req, res) => {
    const userId = req.user.id;

    const keysQuery = 'SELECT * FROM `users` WHERE id = ?';
    db.query(keysQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.render('errors/500');
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'User ID not found' });
        }

        const user = results[0];
        const uid = user.id;
        const archiveName = req.params.archiveName;
        const archivePath = path.join(__dirname, `../../archives/${archiveName}`);

        const archivesQuery = 'SELECT * FROM `archives` WHERE file_name = ? AND user_id = ?';
        db.query(archivesQuery, [archiveName, uid], (err, results) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.render('errors/500');
            }

            if (results.length === 0) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            if (fs.existsSync(archivePath)) {
                res.download(archivePath);
            } else {
                res.status(404).send('File not found');
            }
        });
    });
});

router.get("/get-archives", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;

        const keysQuery = 'SELECT * FROM `users` WHERE id = ?';
        db.query(keysQuery, [userId], (err, results) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.render('errors/500');
            }

            if (results.length === 0) {
                return res.status(400).json({ success: false, message: 'User ID not found' });
            }

            const user = results[0];
            const uid = user.id;

            const archivesQuery = 'SELECT * FROM `archives` WHERE user_id = ?';
            db.query(archivesQuery, [uid], (err, results) => {
                if (err) {
                    console.error('Error occurred:', err);
                    return res.render('errors/500');
                }

                const now = new Date();
                const userArchives = results.map(archive => {
                    const archivePath = path.join(__dirname, `../../archives/${archive.file_name}`);
                    const createdAt = new Date(archive.created_at);
                    const remainingDays = Math.max(0, 30 - Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));
                    const valid = remainingDays > 0;

                    if (!valid && fs.existsSync(archivePath)) {
                        fs.unlinkSync(archivePath);
                    }

                    return {
                        name: archive.file_name,
                        createdAt: archive.created_at,
                        size: valid ? (fs.statSync(archivePath).size / (1024 * 1024)).toFixed(2) : 'N/A',
                        valid: valid
                    };
                });

                userArchives.forEach(archive => {
                    const updateQuery = 'UPDATE `archives` SET valid = ? WHERE file_name = ?';
                    db.query(updateQuery, [archive.valid, archive.name], (updateErr) => {
                        if (updateErr) {
                            console.error('Error occurred:', updateErr);
                        }
                    });
                });

                const hasValidArchive = userArchives.some(archive => archive.valid);

                res.json({ success: true, archives: userArchives, hasValidArchive });
            });
        });
    } catch (error) {
        console.error('Error getting archives:', error);
        return res.render('errors/500');
    }
});

module.exports = router;