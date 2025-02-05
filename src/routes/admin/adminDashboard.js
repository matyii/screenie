const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../functions/auth');
const database = require('../../functions/database');
const getServerSpecs = require('../../functions/getServerSpecs');
const calculateFolderSize = require('../../functions/calculateFolderSize');
const formatSize = require('../../functions/formatSize');
const fs = require('fs');
const path = require('path');

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.permission_level > 1) {
        return next();
    }
    res.redirect('/');
};

router.get('/', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [usersCount] = await database.query('SELECT COUNT(*) AS count FROM users');
        const [uploadsCount] = await database.query('SELECT COUNT(*) AS count FROM uploads');
        const [domainsCount] = await database.query('SELECT COUNT(*) AS count FROM domains');

        const serverSpecs = getServerSpecs();
        const uploadsFolderSize = formatSize(calculateFolderSize(path.join(__dirname, '../../uploads'), 'profile_pictures'));

        res.render('admin/adminDashboard', {
            userData: res.locals.userData,
            stats: {
                users: usersCount.count,
                uploads: uploadsCount.count,
                domains: domainsCount.count,
                uploadsFolderSize
            },
            serverSpecs
        });
    } catch (err) {
        console.error('Error fetching statistics:', err);
        res.render('errors/500');
    }
});

router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await database.query(`
            SELECT users.*, permission_levels.name AS permission_level_name, permission_levels.color AS permission_level_color, storage_capacities.capacity AS storage_capacity,
            (SELECT GROUP_CONCAT(badges.name) FROM badges WHERE FIND_IN_SET(badges.id, REPLACE(REPLACE(REPLACE(users.badges, '[', ''), ']', ''), '"', ''))) AS badges,
            (SELECT GROUP_CONCAT(badges.color) FROM badges WHERE FIND_IN_SET(badges.id, REPLACE(REPLACE(REPLACE(users.badges, '[', ''), ']', ''), '"', ''))) AS badge_colors
            FROM users
            LEFT JOIN permission_levels ON users.permission_level = permission_levels.id
            LEFT JOIN storage_capacities ON users.storage_capacity_id = storage_capacities.id
            GROUP BY users.id
        `);

        const storageCapacities = await database.query('SELECT * FROM storage_capacities');
        const badges = await database.query('SELECT * FROM badges');
        const permissionLevels = await database.query('SELECT * FROM permission_levels');

        users.forEach(user => {
            user.storage_capacity_formatted = formatSize(user.storage_capacity * 1024 * 1024);
            user.badges = user.badges ? user.badges.split(',') : [];
            user.badge_colors = user.badge_colors ? user.badge_colors.split(',') : [];
        });

        res.render('admin/users', { userData: res.locals.userData, users, storageCapacities, badges, permissionLevels, formatSize });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.render('errors/500');
    }
});

router.get('/user/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [user] = await database.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        user.badges = user.badges ? user.badges.split(',').map(Number) : [];
        res.json(user);
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ error: 'Error fetching user details' });
    }
});

router.post('/user/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { username, email, permissionLevel, storageCapacity, vanityURL, private, badges } = req.body;
        const badgesArray = JSON.parse(badges);
        await database.query('UPDATE users SET username = ?, email = ?, permission_level = ?, storage_capacity_id = ?, vanityURL = ?, private = ?, badges = ? WHERE id = ?', 
            [username, email, permissionLevel, storageCapacity, vanityURL, private ? 1 : 0, badgesArray.join(','), req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating user details:', err);
        res.status(500).json({ error: 'Error updating user details' });
    }
});

router.delete('/user/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        if (req.user.id === parseInt(req.params.id, 10)) {
            return res.status(400).json({ error: 'You cannot delete yourself' });
        }

        
        await database.query('DELETE FROM archives WHERE user_id = ?', [req.params.id]);
        await database.query('DELETE FROM uploads WHERE user_id = ?', [req.params.id]);

        
        const userUploadFolder = path.join(__dirname, '../../uploads', req.params.id);
        if (fs.existsSync(userUploadFolder)) {
            fs.rm(userUploadFolder, { recursive: true });
        }

        
        await database.query('DELETE FROM users WHERE id = ?', [req.params.id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

router.get('/uploads', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const uploads = await database.query('SELECT * FROM uploads');
        res.render('admin/uploads', { userData: res.locals.userData, uploads });
    } catch (err) {
        console.error('Error fetching uploads:', err);
        res.render('errors/500');
    }
});

router.get('/upload/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [upload] = await database.query('SELECT * FROM uploads WHERE id = ?', [req.params.id]);
        res.json(upload);
    } catch (err) {
        console.error('Error fetching upload details:', err);
        res.status(500).json({ error: 'Error fetching upload details' });
    }
});

router.delete('/upload/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [upload] = await database.query('SELECT * FROM uploads WHERE id = ?', [req.params.id]);
        const filePath = path.join(__dirname, '../../uploads', upload.user_id.toString(), upload.file_name);

        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        
        await database.query('DELETE FROM uploads WHERE id = ?', [req.params.id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting upload:', err);
        res.status(500).json({ error: 'Error deleting upload' });
    }
});

router.get('/domains', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const domains = await database.query('SELECT * FROM domains');
        res.render('admin/domains', { userData: res.locals.userData, domains });
    } catch (err) {
        console.error('Error fetching domains:', err);
        res.render('errors/500');
    }
});

router.get('/domain/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [domain] = await database.query('SELECT * FROM domains WHERE id = ?', [req.params.id]);
        res.json(domain);
    } catch (err) {
        console.error('Error fetching domain details:', err);
        res.status(500).json({ error: 'Error fetching domain details' });
    }
});

router.post('/domain', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { newDomainName } = req.body;
        await database.query('INSERT INTO domains (domain_name) VALUES (?)', [newDomainName]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error adding domain:', err);
        res.status(500).json({ error: 'Error adding domain' });
    }
});

router.post('/domain/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { domainName } = req.body;
        await database.query('UPDATE domains SET domain_name = ? WHERE id = ?', [domainName, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating domain details:', err);
        res.status(500).json({ error: 'Error updating domain details' });
    }
});

router.delete('/domain/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await database.query('DELETE FROM domains WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting domain:', err);
        res.status(500).json({ error: 'Error deleting domain' });
    }
});

module.exports = router;