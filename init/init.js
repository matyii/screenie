const { execSync } = require('child_process');

console.log('Installing dependencies...');
execSync('npm i', { stdio: 'inherit' });

const crypto = require('crypto');
const fs = require('fs');
const bcrypt = require('bcryptjs');

function generateRandomPassword(length) {
    return crypto.randomBytes(length).toString('hex');
}

function checkMySQL() {
    try {
        execSync('mysql --version', { stdio: 'ignore' });
        return true;
    } catch (err) {
        return false;
    }
}

const sqlPassword = generateRandomPassword(16);
const adminPassword = generateRandomPassword(16);
const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10);
const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

const initSqlContent = `
DROP USER IF EXISTS 'screeniedb'@'127.0.0.1';
CREATE USER 'screeniedb'@'127.0.0.1' IDENTIFIED BY '${sqlPassword}';
GRANT ALL PRIVILEGES ON \`screenie\`.* TO 'screeniedb'@'127.0.0.1';
FLUSH PRIVILEGES;
`.trim();
fs.writeFileSync('init/init.sql', initSqlContent);

const createAdminUserSql = `
USE screenie;
INSERT INTO users (username, password, private, permission_level, registration_date) VALUES ('admin', '${hashedAdminPassword}', 1, 1000, '${formattedDate}');
`.trim();
fs.writeFileSync('init/create_admin_user.sql', createAdminUserSql);

const passwordsContent = `
SQL User Password: ${sqlPassword}
Admin Password: ${adminPassword}
`.trim();
fs.writeFileSync('init/passwords.txt', passwordsContent);

const envContent = `
DB_HOST=127.0.0.1
DB_USER=screeniedb
DB_PASSWORD=${sqlPassword}
DB_NAME=screenie
`.trim();
fs.writeFileSync('.env', envContent);

if (checkMySQL()) {
    try {
        console.log('Creating SQL user...');
        execSync(`mysql -u root -proot < init/init.sql`, { stdio: 'inherit' });

        console.log('Importing database...');
        execSync(`mysql -u root -proot < db.sql`, { stdio: 'inherit' });

        console.log('Creating admin user...');
        execSync(`mysql -u screeniedb -p${sqlPassword} -h 127.0.0.1 < init/create_admin_user.sql`, { stdio: 'inherit' });

        console.log('Initialization complete.');
        console.log('Admin username: admin');
        console.log('Admin password:', adminPassword);
        console.log('Warning: Please check the "maindomain" in data/config.json to ensure it is set correctly.');
        console.log('Warning: Please add the DB_HOST IP to the .env file.');
        console.log('Note: The passwords for the admin user and the SQL user are stored in init/passwords.txt.');
    } catch (error) {
        console.error('Error occurred during the import process. Please run the following SQL commands manually:');
        console.log('==> init/init.sql');
        console.log('==> init/create_admin_user.sql');
        console.log('Admin username: admin');
        console.log('Admin password:', adminPassword);
        console.log('Warning: Please check the "maindomain" in data/config.json to ensure it is set correctly.');
        console.log('Warning: Please add the DB_HOST IP to the .env file.');
        console.log('Note: The passwords for the admin user and the SQL user are stored in init/passwords.txt.');
    }
} else {
    console.log('MySQL is not installed. Please run the following SQL commands manually:');
    console.log('==> init/init.sql');
    console.log('==> init/create_admin_user.sql');
    console.log('Admin username: admin');
    console.log('Admin password:', adminPassword);
    console.log('Warning: Please check the "maindomain" in data/config.json to ensure it is set correctly.');
    console.log('Warning: Please add the DB_HOST IP to the .env file.');
    console.log('Note: The passwords for the admin user and the SQL user are stored in init/passwords.txt.');
}
