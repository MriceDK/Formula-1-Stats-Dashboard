FROM mariadb:latest

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]

COPY init.sql /docker-entrypoint-initdb.d/
COPY datafiles /data

# Building with
# docker build -t formuladb .

# Running with
# docker run --detach -p 3306:3306 --name formula1db  --env MARIADB_ROOT_PASSWORD=1234  formuladb


# Testing commands:
# docker run --detach -p 3307:3306 --name formula1db  --env MARIADB_ROOT_PASSWORD=1234  formuladb

# docker exec -it formula1db bash
# mariadb -u user -p1234
# use formuladb;
# show tables;