const express = require('express');
const router = express.Router();
const checkUploadkey = require('../../functions/generateKey.js');
const { isAuthenticated } = require('../../functions/auth');
const fs = require("fs");
const path = require("path");
const calculateFolderSize = require('../../functions/calculateFolderSize');
const db = require('../../functions/database');
const formatSize = require('../../functions/formatSize');

router.get("/", isAuthenticated, async (req, res) => {
    try {
        const profile = req.user;
        const username = profile["username"];

        checkUploadkey(username, async (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.render('errors/500');
            }

            const [uploadKey, userId] = result;

            if (!userId) {
                throw new Error('User ID not found');
            }

            const userFolder = path.join(__dirname, `../../uploads/${userId}`);
            const folderSize = await calculateFolderSize(userFolder);

            const keysQuery = `
                SELECT users.*, storage_capacities.capacity AS storage_limit, storage_capacities.name AS storage_name
                FROM users
                LEFT JOIN storage_capacities ON users.storage_capacity_id = storage_capacities.id
                WHERE users.id = ?`;
            db.query(keysQuery, [userId], (keysErr, keysResults) => {
                if (keysErr) {
                    console.error('Error fetching user data:', keysErr);
                    return res.render('errors/500');
                }

                const userData = keysResults[0];
                const storageLimit = userData.storage_limit * 1024 * 1024;

                const formatSize = (size) => {
                    if (size >= 1024 * 1024 * 1024 * 1024) {
                        return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
                    } else if (size >= 1024 * 1024 * 1024) {
                        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                    } else if (size >= 1024 * 1024) {
                        return (size / (1024 * 1024)).toFixed(2) + ' MB';
                    } else {
                        return (size / 1024).toFixed(2) + ' KB';
                    }
                };

                const folderSizeFormatted = formatSize(folderSize);
                const storageLimitFormatted = formatSize(storageLimit);
                const folderSizePercentage = (folderSize / storageLimit) * 100;

                const perPage = 12;
                const currentPage = parseInt(req.query.page) || 1;
                const sortOrder = req.query.sortOrder || 'newest';

                const uploadsQuery = 'SELECT * FROM `uploads` WHERE user_id = ?';
                db.query(uploadsQuery, [userId], (uploadsErr, uploadsResults) => {
                    if (uploadsErr) {
                        console.error('Error:', uploadsErr);
                        return res.render('errors/500');
                    }

                    const totalUploads = uploadsResults.length;
                    const totalPages = Math.ceil(totalUploads / perPage);
                    const sortedUploads = uploadsResults.sort((a, b) => {
                        if (sortOrder === 'newest') {
                            return new Date(b.upload_date) - new Date(a.upload_date);
                        } else {
                            return new Date(a.upload_date) - new Date(b.upload_date);
                        }
                    });

                    const paginatedUploads = sortedUploads.slice((currentPage - 1) * perPage, currentPage * perPage);

                    res.render('user/gallery', {
                        images: paginatedUploads,
                        currentPage,
                        totalPages,
                        sortOrder,
                        folderSize: folderSizeFormatted,
                        storageLimit: storageLimitFormatted,
                        folderSizePercentage: folderSizePercentage.toFixed(2),
                        storageName: userData.storage_name
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/gallery', isAuthenticated, async (req, res) => {
    try {
        const userData = res.locals.userData;
        const folderSize = await calculateFolderSize(userData.upload_folder);
        const storageLimit = userData.storage_limit * 1024 * 1024;

        const folderSizeFormatted = formatSize(folderSize / (1024 * 1024)); 
        const storageLimitFormatted = formatSize(storageLimit / (1024 * 1024)); 
        const folderSizePercentage = (folderSize / storageLimit) * 100;

        const perPage = 12;
        const currentPage = parseInt(req.query.page) || 1;
        const sortOrder = req.query.sortOrder || 'newest';

        const uploadsQuery = 'SELECT * FROM `uploads` WHERE user_id = ?';
        db.query(uploadsQuery, [userData.id], (uploadsErr, uploadsResults) => {
            if (uploadsErr) {
                console.error('Error:', uploadsErr);
                return res.render('errors/500');
            }

            const totalUploads = uploadsResults.length;
            const totalPages = Math.ceil(totalUploads / perPage);
            const sortedUploads = uploadsResults.sort((a, b) => {
                if (sortOrder === 'newest') {
                    return new Date(b.upload_date) - new Date(a.upload_date);
                } else {
                    return new Date(a.upload_date) - new Date(b.upload_date);
                }
            });

            const paginatedUploads = sortedUploads.slice((currentPage - 1) * perPage, currentPage * perPage);

            res.render('user/gallery', {
                userData,
                uploads: paginatedUploads,
                currentPage,
                totalPages,
                sortOrder,
                folderSizeFormatted,
                storageLimitFormatted,
                folderSizePercentage
            });
        });
    } catch (err) {
        console.error('Error fetching gallery data:', err);
        res.render('errors/500');
    }
});

router.post('/delete-upload', isAuthenticated, (req, res) => {
    const { filename } = req.body;
    const userId = req.user.id;
    const filePath = path.join(__dirname, `../../uploads/${userId}/${filename}`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist:', err);
            return res.json({ success: false, message: 'File does not exist' });
        }

        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
                return res.render('errors/500');
            }

            const deleteUploadQuery = 'DELETE FROM uploads WHERE user_id = ? AND raw_url LIKE ?';
            db.query(deleteUploadQuery, [userId, `%${filename}`], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting upload from database:', deleteErr);
                    return res.render('errors/500');
                }

                res.json({ success: true, message: 'Upload deleted successfully' });
            });
        });
    });
});

module.exports = router;