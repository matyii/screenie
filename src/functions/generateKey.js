const randomstring = require('randomstring');
const mainDomain = require('./config.js')('maindomain');
const uploadKeyLength = require('./config.js')('uploadkeylength');
const db = require('./database');
const fs = require('fs');
const path = require('path');

const checkUploadkey = (username, callback) => {
    const query = 'SELECT * FROM `users` WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error occurred:', err);
            return callback(err, null);
        }

        if (results.length > 0) {
            const user = results[0];
            const userFolder = path.join(__dirname, `../uploads/${user.id}`);
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }
            if (user.upload_key) {
                return callback(null, [user.upload_key, user.id]);
            } else {
                const code = randomstring.generate(uploadKeyLength);
                const updateQuery = `
                    UPDATE \`users\` 
                    SET upload_key = ?, 
                        domain = ?, 
                        subdomain = ?, 
                        embed_author = ?, 
                        embed_title = ?, 
                        embed_description = ?, 
                        embed_color = ?, 
                        embed_url = ?, 
                        embed_image = ?, 
                        embed_footer = ? 
                    WHERE id = ?`;
                const updateValues = [
                    code,
                    mainDomain,
                    '',
                    username,
                    '',
                    '',
                    '#FFFFFF',
                    '',
                    '',
                    '',
                    user.id
                ];
                db.query(updateQuery, updateValues, (updateErr) => {
                    if (updateErr) {
                        console.error('Error occurred:', updateErr);
                        return callback(updateErr, null);
                    }
                    return callback(null, [code, user.id]);
                });
            }
        } else {
            return callback(new Error('User not found'), null);
        }
    });
};

module.exports = checkUploadkey;