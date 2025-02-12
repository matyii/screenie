#!/bin/bash

if [ $1 = "--vanilla" ]
then
	echo "Updating package list..."
	apt update && apt upgrade -y

	echo "Installing Node.js, npm, and MariaDB..."
	apt install git nodejs npm mariadb-server -y
	npm install pm2 -g
fi

echo "Node.js version:"
node -v

echo "npm version:"
npm -v

echo "Starting MariaDB service..."
service mariadb start
sleep 3

echo "Initializing database..."
mysql -u root -proot -e "source init/initdatabase.sql"

echo "Running init.js..."
node init/init.js
