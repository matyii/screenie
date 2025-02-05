const mysql = require('mysql');
const util = require('util');
const { cyan, red } = require('colorette');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const pool = mysql.createPool({
    connectionLimit: 10,
    ...dbConfig
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error(red("[ERROR]"), 'Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error(red("[ERROR]"), 'Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error(red("[ERROR]"), 'Database connection was refused.');
        }
    }

    if (connection) connection.release();
    console.log(cyan("[DATABASE]"), 'Successfully connected to the database!');
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;