const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const checkUploadkey = require('../../functions/generateKey.js');
const { isAuthenticated } = require('../../functions/auth');
const db = require('../../functions/database');
const calculateFolderSize = require('../../functions/calculateFolderSize');
const formatSize = require('../../functions/formatSize');
const bcrypt = require('bcryptjs');

router.get("/", isAuthenticated, async (req, res) => {
    try {
        const profile = req.user;
        const username = profile["username"];

        checkUploadkey(username, (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.render('errors/500');
            }

            const [uploadKey, userId] = result;

            const keysQuery = `
                SELECT users.*, storage_capacities.capacity AS storage_limit, storage_capacities.name AS storage_name, permission_levels.name AS permission_level_name, permission_levels.color AS permission_level_color
                FROM users
                LEFT JOIN storage_capacities ON users.storage_capacity_id = storage_capacities.id
                LEFT JOIN permission_levels ON users.permission_level = permission_levels.id
                WHERE users.id = ?`;
            db.query(keysQuery, [userId], async (keysErr, keysResults) => {
                if (keysErr) {
                    console.error('Error:', keysErr);
                    return res.render('errors/500');
                }

                const userData = keysResults[0];
                const registrationDate = new Date(userData.registration_date);
                const currentDate = new Date();
                const accountAgeInDays = Math.floor((currentDate - registrationDate) / (1000 * 60 * 60 * 24));
                const accountAge = Math.floor(accountAgeInDays / 365);

                const userFolder = path.join(__dirname, `../../uploads/${userId}`);
                const folderSize = await calculateFolderSize(userFolder);
                const storageLimit = userData.storage_limit * 1024 * 1024; 

                const folderSizeFormatted = formatSize(folderSize); 
                const storageLimitFormatted = formatSize(storageLimit); 
                const folderSizePercentage = (folderSize / storageLimit) * 100;

                userData.profilepic = userData.profile_picture ? `/api/profile_pictures/${userData.profile_picture}` : '/assets/images/placeholder.png';
                userData.accountAge = accountAge;
                userData.accountAgeInDays = accountAgeInDays;
                userData.uploadkey = uploadKey;
                userData.folderSize = folderSizeFormatted;
                userData.storageLimit = storageLimitFormatted;
                userData.folderSizePercentage = folderSizePercentage.toFixed(2);

                function verifyPassword(inputPassword, hashedPassword) {
                    return bcrypt.compareSync(inputPassword, hashedPassword);
                }

                const user = req.user;
                const defaultPassword = 'screenieadmin';

                if (user.username === 'admin' && user.permission_level === 1000) {
                    if (verifyPassword(defaultPassword, user.password)) {
                        userData.warning = 'defaultpassword';
                    }
                }

                const uploadsCountQuery = 'SELECT COUNT(*) AS uploadsCount FROM uploads WHERE user_id = ?';
                db.query(uploadsCountQuery, [userId], (uploadsErr, uploadsResults) => {
                    if (uploadsErr) {
                        console.error('Error fetching uploads count:', uploadsErr);
                        return res.render('errors/500');
                    }

                    const uploadsCount = uploadsResults[0].uploadsCount;
                    userData.uploadsCount = uploadsCount;

                    const userBadges = userData.badges ? userData.badges.split(',') : [];
                    if (userBadges.length > 0) {
                        const badgesQuery = 'SELECT name, color FROM badges WHERE id IN (?)';
                        db.query(badgesQuery, [userBadges], (badgesErr, badgesResults) => {
                            if (badgesErr) {
                                console.error('Error fetching badges:', badgesErr);
                                return res.render('errors/500');
                            }

                            userData.badges = badgesResults;

                            res.render('user/dashboard', {
                                userData
                            });
                        });
                    } else {
                        userData.badges = [];
                        res.render('user/dashboard', {
                            userData
                        });
                    }
                });
            });
        });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.render('errors/500');
    }
});

router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const userData = res.locals.userData;
        const folderSize = await calculateFolderSize(userData.upload_folder);
        const storageLimit = userData.storage_limit;

        const folderSizeFormatted = formatSize(folderSize / (1024 * 1024)); 
        const storageLimitFormatted = formatSize(storageLimit); 
        const folderSizePercentage = (folderSize / (storageLimit * 1024 * 1024)) * 100;

        userData.profilepic = userData.profile_picture ? `/api/profile_pictures/${userData.profile_picture}` : '/assets/images/placeholder.png';
        userData.folderSizeFormatted = folderSizeFormatted;
        userData.storageLimitFormatted = storageLimitFormatted;
        userData.folderSizePercentage = folderSizePercentage;

        res.render('user/dashboard', { userData });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.render('errors/500');
    }
});

router.post('/wipe-uploads', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    const userFolder = path.join(__dirname, `../../uploads/${userId}`);

    fs.rm(userFolder, { recursive: true }, (err) => {
        if (err) {
            console.error('Error wiping uploads:', err);
            return res.render('errors/500');
        }

        fs.mkdir(userFolder, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
                console.error('Error recreating user folder:', mkdirErr);
                return res.render('errors/500');
            }

            const deleteUploadsQuery = 'DELETE FROM uploads WHERE user_id = ?';
            db.query(deleteUploadsQuery, [userId], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting uploads from database:', deleteErr);
                    return res.render('errors/500');
                }

                res.json({ success: true, message: 'Uploads wiped successfully' });
            });
        });
    });
});

module.exports = router;