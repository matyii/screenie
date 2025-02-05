const path = require('path');

const handle404 = (req, res, next) => {
    res.status(404).render('errors/404');
};

module.exports = {
    handle404
};