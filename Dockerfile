FROM debian:latest

RUN apt update && apt upgrade -y
RUN apt install git npm mariadb-server -y

RUN git clone -b development https://github.com/matyii/screenie.git

WORKDIR /screenie

RUN service mariadb start

ENTRYPOINT [ "chmod +x install.sh && ./install.sh" ] 

# ENTRYPOINT service mariadb start; npm start