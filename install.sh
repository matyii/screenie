#!/bin/bash

echo "Updating package list..."
sudo apt update && apt upgrade -y

echo "Installing Node.js, npm, and MariaDB..."
sudo apt install git nodejs npm mariadb-server -y

echo "Node.js version:"
node -v

echo "npm version:"
npm -v

echo "Starting MariaDB service..."
sudo service mariadb start
sleep 3

echo "Initializing database..."
sudo mysql -u root -proot -e "source init/initdatabase.sql"

echo "Running init.js..."
node init/init.js