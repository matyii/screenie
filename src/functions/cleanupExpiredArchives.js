const fs = require("fs");
const path = require("path");
const { yellow, red } = require('colorette');
const db = require('./database');

const cleanupExpiredArchives = () => {
    const now = new Date();

    console.log(yellow('[INFO]'), 'Starting cleanup of expired archives...');

    const archivesQuery = 'SELECT * FROM `archives`';
    db.query(archivesQuery, (err, results) => {
        if (err) {
            console.error('Error occurred:', err);
            return;
        }

        results.forEach(archive => {
            const archivePath = path.join(__dirname, `../archives/${archive.file_name}`);
            const createdAt = new Date(archive.created_at);
            const remainingDays = Math.max(0, 30 - Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));
            const valid = remainingDays > 0;

            if (!valid && fs.existsSync(archivePath)) {
                fs.unlinkSync(archivePath);
                console.log(red('[INFO]'), `Deleted expired archive: ${archive.file_name}`);
            }

            const updateQuery = 'UPDATE `archives` SET valid = ? WHERE file_name = ?';
            db.query(updateQuery, [valid, archive.file_name], (updateErr) => {
                if (updateErr) {
                    console.error('Error occurred:', updateErr);
                }
            });
        });

        console.log(yellow('[INFO]'), 'Cleanup of expired archives completed.');
    });
};

module.exports = cleanupExpiredArchives;