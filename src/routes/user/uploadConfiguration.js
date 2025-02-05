const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const checkUploadkey = require('../../functions/generateKey.js');
const { isAuthenticated } = require('../../functions/auth');
const db = require('../../functions/database');
const mainDomain = require('../../functions/config.js')('maindomain');

router.get("/", isAuthenticated, async (req, res) => {
    try {
        const profile = req.user;
        const userId = profile.id;

        const keysQuery = `
            SELECT users.*, storage_capacities.name AS storage_name, storage_capacities.capacity AS storage_limit
            FROM users
            LEFT JOIN storage_capacities ON users.storage_capacity_id = storage_capacities.id
            WHERE users.id = ?`;
        db.query(keysQuery, [userId], async (keysErr, keysResults) => {
            if (keysErr) {
                console.error('Error:', keysErr);
                return res.render('errors/500');
            }

            const userData = keysResults[0];

            checkUploadkey(userData.username, (err, result) => {
                if (err) {
                    console.error('Error checking upload key:', err);
                    return res.render('errors/500');
                }

                const [uploadKey, userId] = result;

                if (!uploadKey) {
                    console.error('Invalid or missing upload key');
                    return res.status(400).send('Invalid or missing upload key');
                }

                const domainQuery = 'SELECT domain, subdomain FROM `users` WHERE id = ?';
                db.query(domainQuery, [userId], (domainErr, domainResults) => {
                    if (domainErr) {
                        console.error('Error fetching domain data:', domainErr);
                        return res.render('errors/500');
                    }

                    const domainData = domainResults[0];
                    const domainsQuery = 'SELECT * FROM `domains`';
                    db.query(domainsQuery, (domainsErr, domainsResults) => {
                        if (domainsErr) {
                            console.error('Error fetching domains:', domainsErr);
                            return res.render('errors/500');
                        }

                        const selectedDomain = domainData.domain || domainsResults[0].domain_name;

                        const embedQuery = 'SELECT embed_title, embed_description, embed_color, embed_url, embed_image, embed_footer FROM `users` WHERE id = ?';
                        db.query(embedQuery, [userId], (embedErr, embedResults) => {
                            if (embedErr) {
                                console.error('Error fetching embed data:', embedErr);
                                return res.render('errors/500');
                            }

                            const embedData = embedResults[0];
                            res.render('user/uploadConfiguration', {
                                profile,
                                userData,
                                mainDomain,
                                uploadKey: uploadKey,
                                domain: domainData.domain,
                                subdomain: domainData.subdomain,
                                domains: domainsResults.map(domain => domain.domain_name),
                                selectedDomain,
                                embedTitle: embedData.embed_title || '',
                                embedDescription: embedData.embed_description || '',
                                embedColor: embedData.embed_color || '',
                                embedURL: embedData.embed_url || '',
                                embedImage: embedData.embed_image || '',
                                embedFooter: embedData.embed_footer || ''
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update-domain', isAuthenticated, async (req, res) => {
    try {
        const { subdomain, domain } = req.body;
        const userId = req.user.id;

        const updateQuery = 'UPDATE `users` SET domain = ?, subdomain = ? WHERE id = ?';
        db.query(updateQuery, [domain, subdomain, userId], (err) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.render('errors/500');
            }

            req.session.subdomain = subdomain;
            req.session.domain = domain;

            res.redirect('/dashboard/uploadpreferences');
        });
    } catch (error) {
        console.error('Error:', error);
        return res.render('errors/500');
    }
});

router.post('/update-embed', isAuthenticated, (req, res) => {
    const { embedTitle, embedDescription, embedColor, embedURL, embedImage, embedFooter } = req.body;
    const userId = req.user.id;

    const updateQuery = 'UPDATE `users` SET embed_title = ?, embed_description = ?, embed_color = ?, embed_url = ?, embed_image = ?, embed_footer = ? WHERE id = ?';
    db.query(updateQuery, [embedTitle, embedDescription, embedColor, embedURL, embedImage, embedFooter, userId], (err) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.render('errors/500');
        }

        res.redirect('/dashboard/uploadpreferences');
    });
});

module.exports = router;