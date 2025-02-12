FROM debian:latest

RUN apt update && apt upgrade -y
RUN apt install git nodejs npm mariadb-server -y
RUN npm install pm2 -g

RUN git clone -b development https://github.com/matyii/screenie.git

WORKDIR /screenie

RUN service mariadb start && chmod +x install.sh && ./install.sh  

ENTRYPOINT ["service mariadb start;", "pm2-runtime . --name screenie;"]