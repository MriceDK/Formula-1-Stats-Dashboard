FROM mariadb:latest

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]

COPY init.sql /docker-entrypoint-initdb.d/
COPY datafiles /data

# Building with
# docker build -t formuladb .

# Running with
# docker run --detach -p 3306:3306 --name formuladb1  --env MARIADB_ROOT_PASSWORD=1234  formuladb

# docker run --detach -p 3307:3306 --name formuladb1  --env MARIADB_ROOT_PASSWORD=1234  formuladb