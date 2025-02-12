const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const bcryptjs = require('bcryptjs');
const sharp = require('sharp');
const randomstring = require('randomstring');
const fs = require('fs');
const db = require('../../functions/database'); 

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

router.get('/', isAuthenticated, (req, res) => {
  res.render('user/editProfile', { user: req.user });
});

router.post('/updateUser', isAuthenticated, (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.user.id;

  db.query('SELECT username, email FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) {
      console.error('Error occurred during user selection:', err);
      return res.render('errors/500');
    }

    const user = results[0];
    if (user.username === username && user.email === email && !password) {
      return res.redirect('/dashboard/editprofile');
    }

    let hashedPassword = null;
    if (password) {
      try {
        hashedPassword = await bcryptjs.hash(password, 10);
      } catch (hashErr) {
        console.error('Error occurred during password hashing:', hashErr);
        return res.render('errors/500');
      }
    }

    let updateUserQuery = `
      UPDATE users
      SET username = ?, email = ?`;
    const queryParams = [username, email];

    if (hashedPassword) {
      updateUserQuery += `, password = ?`;
      queryParams.push(hashedPassword);
    }

    updateUserQuery += ` WHERE id = ?`;
    queryParams.push(userId);

    db.query(updateUserQuery, queryParams, (updateErr) => {
      if (updateErr) {
        console.error('Error occurred during user update:', updateErr);
        return res.render('errors/500');
      }
      res.redirect('/dashboard/editprofile');
    });
  });
});

router.post('/updateUserPage', isAuthenticated, (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '../../uploads/profile_pictures');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error occurred during form parsing:', err);
      return res.render('errors/500');
    }

    const userId = req.user.id;
    const vanityURL = fields.vanityURL;
    const youtubeURL = fields.youtubeURL;
    const profilePicture = files.profilePicture;
    const isPrivate = fields.private === 'on';
    const pronouns = fields.pronouns;
    const bio = fields.bio;
    const hideNavbar = fields.hideNavbar === 'on';

    db.query('SELECT vanityURL, private, profile_picture, youtubeURL, pronouns, bio, hideNavbar FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error occurred during user selection:', err);
        return res.render('errors/500');
      }

      const user = results[0];
      if (user.vanityURL === vanityURL && user.private === isPrivate && user.youtubeURL === youtubeURL && user.pronouns === pronouns && user.bio === bio && user.hideNavbar === hideNavbar && (!profilePicture || profilePicture.size === 0)) {
        return res.redirect('/dashboard/editprofile');
      }

      const updateProfileLinkQuery = `
        UPDATE users
        SET vanityURL = ?, private = ?, youtubeURL = ?, pronouns = ?, bio = ?, hideNavbar = ?
        WHERE id = ?`;
      db.query(updateProfileLinkQuery, [vanityURL, isPrivate, youtubeURL, pronouns, bio, hideNavbar, userId], (err, result) => {
        if (err) {
          console.error('Error occurred during vanity URL update:', err);
          return res.render('errors/500');
        }

        if (profilePicture && profilePicture.size > 0 && profilePicture.path) {
          const profilePictureExtension = path.extname(profilePicture.name);
          if (profilePictureExtension) {
            const profilePictureFilename = `${randomstring.generate(8)}${profilePictureExtension}`;
            const newFilePath = path.join(form.uploadDir, profilePictureFilename);
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (allowedMimeTypes.includes(profilePicture.type)) {
              if (user.profile_picture) {
                const oldFilePath = path.join(form.uploadDir, user.profile_picture);
                fs.unlink(oldFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error('Error occurred while deleting old profile picture:', unlinkErr);
                  }
                });
              }
              let sharpInstance = sharp(profilePicture.path, { animated: profilePicture.type === 'image/gif' });

              const deleteTempFile = (tempFilePath) => {
                fs.unlink(tempFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    if (unlinkErr.code === 'EBUSY') {
                      setTimeout(() => deleteTempFile(tempFilePath), 100);
                    } else {
                      console.error('Error occurred while deleting temporary file:', unlinkErr);
                    }
                  }
                });
              };

              if (profilePicture.type === 'image/gif') {
                sharpInstance
                  .resize(256, 256)
                  .gif({ dither: 0 })
                  .toFile(newFilePath, (err) => {
                    if (err) {
                      console.error('Error occurred while processing image:', err);
                      return res.render('errors/500');
                    }
                    fs.unlink(profilePicture.path, (unlinkErr) => {
                      if (unlinkErr) {
                        console.error('Error occurred while deleting temporary file:', unlinkErr);
                      }
                    });
                    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePictureFilename, userId], (updateErr) => {
                      if (updateErr) {
                        console.error('Error occurred during profile picture update:', updateErr);
                        return res.render('errors/500');
                      }
                      res.redirect('/dashboard/editprofile');
                    });
                  });
              } else {
                sharpInstance
                  .resize(256, 256, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                  })
                  .toFile(newFilePath, (err) => {
                    if (err) {
                      console.error('Error occurred while processing image:', err);
                      return res.render('errors/500');
                    }
                    fs.unlink(profilePicture.path, (unlinkErr) => {
                      if (unlinkErr) {
                        console.error('Error occurred while deleting temporary file:', unlinkErr);
                      }
                    });
                    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePictureFilename, userId], (updateErr) => {
                      if (updateErr) {
                        console.error('Error occurred during profile picture update:', updateErr);
                        return res.render('errors/500');
                      }
                      res.redirect('/dashboard/editprofile');
                    });
                  });
              }
            } else {
              return res.render('errors/415');
            }
          } else {
            res.redirect('/dashboard/editprofile');
          }
        } else {
          res.redirect('/dashboard/editprofile');
        }
      });
    });
  });
});

router.post('/checkVanityURL', isAuthenticated, (req, res) => {
  const { vanityURL } = req.body;
  const checkVanityURLQuery = 'SELECT COUNT(*) AS count FROM users WHERE vanityURL = ?';
  db.query(checkVanityURLQuery, [vanityURL], (err, results) => {
    if (err) {
      console.error('Error occurred during vanity URL check:', err);
      return res.json({ success: false, message: 'Error occurred during vanity URL check' });
    }
    if (results[0].count > 0) {
      return res.json({ success: false, message: 'Vanity URL is already in use' });
    }
    res.json({ success: true });
  });
});

module.exports = router;