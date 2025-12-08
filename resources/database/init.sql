-- Complete MySQL script to load F1 dataset
-- Run this after placing ALL CSV files in logic/data/datafiles/ on your MySQL server
-- Adjust paths as needed. Uses LOAD DATA LOCAL INFILE for client-side files.

-- Disable foreign key checks and safe mode during bulk load
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;
SET GLOBAL local_infile = 1;

CREATE USER 'user' IDENTIFIED BY '1234';
CREATE DATABASE formuladb;

GRANT ALL PRIVILEGES ON formuladb.* to 'user';

USE formuladb;

-- =====================================
-- 1. CREATE TABLES (in dependency order)
-- =====================================

CREATE TABLE circuits (
  circuit_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  lat DECIMAL(10,6),
  `long` DECIMAL(10,6),
  locality VARCHAR(100),
  country VARCHAR(100),
  wikipedia_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE races (
  race_id VARCHAR(20) PRIMARY KEY,
  season INT,
  round_num INT,
  race_name VARCHAR(255),
  date DATE,
  time VARCHAR(20),
  circuit_id VARCHAR(50),
  INDEX idx_season_round (season, round_num),
  INDEX idx_circuit (circuit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE drivers (
  driver_id VARCHAR(50) PRIMARY KEY,
  givenName VARCHAR(100),
  familyName VARCHAR(100),
  nationality VARCHAR(50),
  dob DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE constructors (
  constructor_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  nationality VARCHAR(50),
  wikipedia_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE results (
  race_id VARCHAR(20),
  driver_id VARCHAR(50),
  constructor_id VARCHAR(50),
  grid INT,
  position VARCHAR(10),
  position_order INT,
  points DECIMAL(5,2),
  laps INT,
  status VARCHAR(100),
  PRIMARY KEY (race_id, driver_id),
  KEY idx_driver (driver_id),
  KEY idx_constructor (constructor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE qualifying (
  race_id VARCHAR(20),
  driver_id VARCHAR(50),
  constructor_id VARCHAR(50),
  position INT,
  q1 TIME,
  q2 TIME,
  q3 TIME,
  PRIMARY KEY (race_id, driver_id),
  KEY idx_driver (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE driver_standings (
  season INT,
  round_num INT,
  driver_id VARCHAR(50),
  position INT,
  points DECIMAL(8,1),
  wins INT,
  PRIMARY KEY (season, round_num, driver_id),
  KEY idx_driver (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE constructor_standings (
  season INT,
  round_num INT,
  constructor_id VARCHAR(50),
  position INT,
  points DECIMAL(8,1),
  wins INT,
  PRIMARY KEY (season, round_num, constructor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Skip f1_2025_last_race_results.csv - it's JSON-like, not standard CSV format [file:5]

-- =====================================
-- 2. LOAD DATA (in correct dependency order)
-- =====================================

-- Load circuits first
LOAD DATA LOCAL INFILE './datafiles/circuits.csv'
INTO TABLE circuits
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(circuit_id, name, lat, `long`, locality, country, wikipedia_url); [file:3]

-- Load races (references circuits)
LOAD DATA LOCAL INFILE './datafiles/races.csv'
INTO TABLE races
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(race_id, @season, round_num, race_name, date, time, circuit_id)
SET season = @season; [file:2]

-- Load drivers and constructors (independent)
LOAD DATA LOCAL INFILE './datafiles/drivers.csv'
INTO TABLE drivers
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(driver_id, givenName, familyName, nationality, dob); [file:6]

LOAD DATA LOCAL INFILE './datafiles/constructors.csv'
INTO TABLE constructors
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(constructor_id, name, nationality, wikipedia_url); [file:4]

-- Load results (references races/drivers/constructors)
LOAD DATA LOCAL INFILE './datafiles/results.csv'
INTO TABLE results
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(race_id, driver_id, constructor_id, grid, position, position_order, points, laps, status); [file:1]

-- Load qualifying
LOAD DATA LOCAL INFILE './datafiles/qualifying.csv'
INTO TABLE qualifying
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(race_id, driver_id, constructor_id, position, q1, q2, q3); [file:8]

-- Load standings
LOAD DATA LOCAL INFILE './datafiles/driver_standings.csv'
INTO TABLE driver_standings
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(season, round_num, driver_id, position, points, wins); [file:7]

LOAD DATA LOCAL INFILE './datafiles/constructor_standings.csv'
INTO TABLE constructor_standings
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(season, round_num, constructor_id, position, points, wins); [file:9]

-- =====================================
-- 3. ADD FOREIGN KEYS (after all data loaded)
-- =====================================

ALTER TABLE races
ADD CONSTRAINT fk_races_circuit
FOREIGN KEY (circuit_id) REFERENCES circuits(circuit_id);

ALTER TABLE results
ADD CONSTRAINT fk_results_race
FOREIGN KEY (race_id) REFERENCES races(race_id),
ADD CONSTRAINT fk_results_driver
FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
ADD CONSTRAINT fk_results_constructor
FOREIGN KEY (constructor_id) REFERENCES constructors(constructor_id);

ALTER TABLE qualifying
ADD CONSTRAINT fk_qualifying_race
FOREIGN KEY (race_id) REFERENCES races(race_id),
ADD CONSTRAINT fk_qualifying_driver
FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
ADD CONSTRAINT fk_qualifying_constructor
FOREIGN KEY (constructor_id) REFERENCES constructors(constructor_id);

ALTER TABLE driver_standings
ADD CONSTRAINT fk_driver_standings_driver
FOREIGN KEY (driver_id) REFERENCES drivers(driver_id);

ALTER TABLE constructor_standings
ADD CONSTRAINT fk_constructor_standings_constructor
FOREIGN KEY (constructor_id) REFERENCES constructors(constructor_id);

-- Re-enable constraints
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- =====================================
-- 4. VALIDATION QUERIES
-- =====================================
SELECT 'Tables loaded successfully!' as Status;
SELECT COUNT(*) as circuits FROM circuits;
SELECT COUNT(*) as races FROM races;
SELECT COUNT(*) as drivers FROM drivers;
SELECT COUNT(*) as constructors FROM constructors;
SELECT COUNT(*) as results FROM results;
SELECT COUNT(*) as qualifying FROM qualifying;
SELECT COUNT(*) as driver_standings FROM driver_standings;
SELECT COUNT(*) as constructor_standings FROM constructor_standings; [file:1][file:2][file:3][file:4][file:6][file:7][file:8][file:9]

-- Quick test query
SELECT r.race_name, d.givenName, d.familyName, res.position, c.name as constructor
FROM results res
JOIN races r ON res.race_id = r.race_id
JOIN drivers d ON res.driver_id = d.driver_id
JOIN constructors c ON res.constructor_id = c.constructor_id
WHERE r.season = 2024
ORDER BY r.date DESC, res.position_order
LIMIT 10;
