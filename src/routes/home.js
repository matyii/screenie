const express = require('express');
const router = express.Router();
const loadFunctions = require("../functions/loadFunctions");

router.get("/", (req, res) => {
    res.render('homepage/index', { userData: res.locals.userData });
});


router.get("/discord", (req, res) => {
    res.redirect(loadFunctions.config("discordInviteURL"));
});

module.exports = router;