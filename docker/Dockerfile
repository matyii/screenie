FROM debian:latest

RUN apt update && apt upgrade
RUN apt install git npm mariadb-server -y

RUN git clone https://github.com/matyii/screenie.git

WORKDIR /screenie

COPY user.sql /screenie/user.sql

RUN service mariadb start && mariadb < db.sql && mariadb < user.sql

RUN npm i

COPY .env /screenie/.env

ENTRYPOINT service mariadb start; npm start

