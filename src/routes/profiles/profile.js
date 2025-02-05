const express = require('express');
const router = express.Router();
const db = require('../../functions/database');

router.get("/", (req, res) => {
    res.redirect("/");
});

router.get("/:vanityURL", (req, res) => {
    const vanityURL = req.params.vanityURL;

    db.query('SELECT username, profile_picture, badges, permission_level, private, youtubeURL, bio, pronouns, hideNavbar FROM users WHERE vanityURL = ?', [vanityURL], (err, results) => {
        if (err) {
            console.error('Error occurred during user selection:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.render('profiles/publicProfile', { userNotFound: true });
        }

        const user = results[0];
        const userBadges = user.badges ? user.badges.split(',') : [];

        if (userBadges.length > 0) {
            const badgesQuery = 'SELECT name, color FROM badges WHERE id IN (?)';
            db.query(badgesQuery, [userBadges], (badgesErr, badgesResults) => {
                if (badgesErr) {
                    console.error('Error fetching badges:', badgesErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const badges = badgesResults.map(badge => ({
                    name: badge.name,
                    color: badge.color
                }));

                const permissionQuery = 'SELECT name, color FROM permission_levels WHERE id = ?';
                db.query(permissionQuery, [user.permission_level], (permErr, permResults) => {
                    if (permErr) {
                        console.error('Error occurred during permission level selection:', permErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    const permissionLevel = permResults[0] ? {
                        name: permResults[0].name,
                        color: permResults[0].color
                    } : { name: 'Unknown', color: 'secondary' };

                    res.render('profiles/publicProfile', { user, badges, permissionLevel, userNotFound: false });
                });
            });
        } else {
            const badges = [];

            const permissionQuery = 'SELECT name, color FROM permission_levels WHERE id = ?';
            db.query(permissionQuery, [user.permission_level], (permErr, permResults) => {
                if (permErr) {
                    console.error('Error occurred during permission level selection:', permErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const permissionLevel = permResults[0] ? {
                    name: permResults[0].name,
                    color: permResults[0].color
                } : { name: 'Unknown', color: 'secondary' };

                res.render('profiles/publicProfile', { user, badges, permissionLevel, userNotFound: false });
            });
        }
    });
});

module.exports = router;