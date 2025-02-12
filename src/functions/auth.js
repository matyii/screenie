const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./database");
const flash = require("connect-flash");
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const query = 'SELECT * FROM `users` WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    (username, password, done) => {
      const query = 'SELECT * FROM `users` WHERE username = ?';
      db.query(query, [username], (err, results) => {
        if (err) return done(err);
        if (results.length === 0) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) return done(err);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
      });
    }
  )
);

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

module.exports = (app) => {
  app.use(
    session({
      secret: "screenie",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
  }));

  app.get("/logout", (req, res) => {
    req.logout(err => {
      if (err) { return next(err); }
      req.session.destroy();
      res.redirect("/");
    });
  });
};

module.exports.isAuthenticated = isAuthenticated;
