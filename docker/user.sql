CREATE USER 'screenie'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES on `screenie.host`.* to 'screenie'@'localhost' WITH GRANT OPTION;

/*mariadb secure installation scripts queries*/
/*set root password*/
UPDATE mysql.global_priv SET priv=(json_set(priv, '$.plugin', 'mysql_native_password', '$.authentication_string', PASSWORD('abcdef'))) WHERE User='root';
/*remove anonymous users*/
DELETE FROM mysql.global_priv WHERE User ='';
/*remove remote root*/
DELETE FROM mysql.global_priv WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
/*remove test database*/
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
/*reload privilege tables*/

FLUSH PRIVILEGES;
