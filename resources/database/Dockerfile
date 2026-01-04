FROM mariadb:latest

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]

COPY init.sql /docker-entrypoint-initdb.d/
COPY datafiles /data

# Building with
# docker build -t formuladb .

# Running with
# docker run --detach -p 3306:3306 --name formula1db  --env MARIADB_ROOT_PASSWORD=.env.DB_PASSWORD  formuladb


# Testing commands:
# docker run --detach -p 3307:3306 --name formula1db  --env MARIADB_ROOT_PASSWORD=.env.DB_PASSWORD  formuladb

# docker exec -it formula1db bash
# mariadb -u .env.DB_USER -p.env.DB_PASSWORD
# use formuladb;
# show tables;