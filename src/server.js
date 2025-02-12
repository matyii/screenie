const express = require('express');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const { green } = require('colorette');
const loadFunctions = require("./functions/loadFunctions");
const folders = require('./data/folders.json');
const routes = require('./data/routes.json');
const { handle404 } = require('./functions/httpErrorHandling');
const auth = require('./functions/auth');
const database = require('./functions/database');
const app = express();
const appDir = __dirname.replace("src", "");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
auth(app);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        const query = 'SELECT * FROM `users` WHERE id = ?';
        database.query(query, [req.user.id], (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return next(err);
            }
            res.locals.userData = results[0];
            next();
        });
    } else {
        next();
    }
});

loadFunctions.checkFolder(folders);
loadFunctions.loadRoutes(app, routes);

app.listen(loadFunctions.config("nodeserverport"), () => {
    console.log(green("[SERVER]"), `Server is running on port ${loadFunctions.config("nodeserverport")}`);
});

app.use(express.static(appDir + "/views/"));
app.use('/assets/', serveIndex(appDir + '/assets/'));
app.use(handle404);