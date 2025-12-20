import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

// -------------------
// # GENERAL QUERIES #
// -------------------
const GETALLDRIVERSQUERY = "SELECT * FROM `drivers`;";
const SINGLEDRIVERQUERY = "SELECT * from `drivers` WHERE `driver_id` = ?;";
const CREATEDRIVERQUERY = "INSERT INTO `drivers` (`driver_id`, `givenName`, `familyName`, `nationality`, `dob`) VALUES (?, ?, ?, ?, ?);";
const UPDATEDRIVERQUERY = "UPDATE `drivers` SET givenName = ?, familyName = ?, nationality = ?, dob = ? WHERE `driver_id` = ?;";
const DELETEDRIVERQUERY = "DELETE FROM `drivers` WHERE `driver_id` = ?;";

// -------------------
// # SPECIAL QUERIES #
// -------------------

const TOTALWINSSINGLEDRIVERQUERY = `SELECT CONCAT(d.givenName, ' ', d.familyName) AS driver, SUM(CASE WHEN r.position_order = 1 THEN 1 ELSE 0 END) AS total_wins, COUNT(DISTINCT r.race_id) AS total_races, ROUND(SUM(CASE WHEN r.position_order = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT r.race_id), 2) AS win_percentage FROM results r JOIN drivers d ON r.driver_id = d.driver_id WHERE d.driver_id = ? GROUP BY r.driver_id, d.givenName, d.familyName;`;
const QUALIFYINGSTATSSINGLEDRIVERQUERY = `SELECT CONCAT(d.givenName, ' ', d.familyName) AS driver, COUNT(CASE WHEN q.position = 1 THEN 1 END) AS poles, COUNT(CASE WHEN q.position <= 3 THEN 1 END) AS top_3_qualifying, ROUND(AVG(q.position), 2) AS avg_qual_pos, COUNT(DISTINCT q.race_id) AS total_sessions FROM qualifying q JOIN drivers d ON q.driver_id = d.driver_id WHERE d.driver_id = ? GROUP BY q.driver_id, d.givenName, d.familyName;`;
const OVERTAKINGABILITYSINGLEDRIVERQUERY = `SELECT CONCAT(d.givenName, ' ', d.familyName) AS driver, COUNT(DISTINCT r.race_id) AS races, ROUND(AVG(r.grid * 1.0), 2) AS avg_start_pos, ROUND(AVG(r.position_order * 1.0), 2) AS avg_finish_pos, ROUND(AVG(r.position_order - r.grid), 2) AS avg_positions_gained, ROUND(SUM(CASE WHEN r.position_order < r.grid THEN 1 ELSE 0 END)*100.0/COUNT(DISTINCT r.race_id), 2) AS beat_start_pct FROM results r JOIN drivers d ON r.driver_id = d.driver_id WHERE d.driver_id = ? AND r.grid > 0 AND r.position_order > 0 GROUP BY r.driver_id, d.givenName, d.familyName;`;
const DRIVERVSTEAMMATESTATSQUERY = `SELECT CONCAT(d.givenName, ' ', d.familyName) AS driver, COUNT(DISTINCT r1.race_id) AS total_teammate_races, ROUND((AVG(q1.position < q2.position) + AVG(r1.position_order < r2.position_order))/2 * 100, 1) AS teammate_dominance_score FROM results r1 JOIN results r2 ON r2.race_id = r1.race_id AND r2.constructor_id = r1.constructor_id AND r2.driver_id != r1.driver_id JOIN qualifying q1 ON q1.race_id = r1.race_id AND q1.driver_id = r1.driver_id JOIN qualifying q2 ON q2.race_id = r2.race_id AND q2.driver_id = r2.driver_id JOIN drivers d ON d.driver_id = r1.driver_id WHERE r1.driver_id = ? AND q1.position IS NOT NULL AND q2.position IS NOT NULL GROUP BY r1.driver_id, d.givenName, d.familyName;`;
const ALLPOSITIONSSINGLEDRIVERQUERY = `SELECT driver_id, position, COUNT(*) as count FROM results WHERE position IS NOT NULL AND driver_id = ? GROUP BY driver_id, position ORDER BY driver_id, position;`;



async function getAllDrivers() {
    return await executeWithResult(GETALLDRIVERSQUERY);
}

async function getDriverFromId(id) {
    const driver = await executeWithResult(SINGLEDRIVERQUERY, id).then(results => results[0]);
    if (driver === undefined) throw new UnexistingResourceError("Invalid Driver ID");
    return driver;
}

async function create(data) {

    if (data === undefined)
        throw new BodyParsingError("Body cannot be empty");
    const { driver_id, givenName, familyName, nationality, dob } = data;
    if (driver_id === undefined || givenName === undefined || familyName === undefined)
        throw new BodyParsingError("Body must contain all driver fields");
    const existingDriver = await getDriverFromId(driver_id).catch(() => null);
    if (existingDriver !== null) throw new BodyParsingError("Driver ID already exists");
    return await executeWithoutResult(CREATEDRIVERQUERY, driver_id, givenName, familyName, nationality, dob);
}

async function update(id, data) {
    if (data === undefined) throw new BodyParsingError("Body cannot be empty");
    const { givenName, familyName, nationality, dob } = data;
    if (givenName === undefined || familyName === undefined)
        throw new BodyParsingError("Body must contain all driver fields");
    const affected = await executeWithoutResult(UPDATEDRIVERQUERY, givenName, familyName, nationality, dob, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
    return affected;
}

async function remove(id) {
    const affected = await executeWithoutResult(DELETEDRIVERQUERY, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
}

async function getTotalWinsById(id) {
    const driver = await executeWithResult(TOTALWINSSINGLEDRIVERQUERY, id);
    if (driver === undefined) throw new UnexistingResourceError("Invalid Driver ID");
    return driver[0];
}

async function getQualifyingStatsById(id) {
    const driver = await executeWithResult(QUALIFYINGSTATSSINGLEDRIVERQUERY, id);
    if (driver === undefined) throw new UnexistingResourceError("Invalid Driver ID");
    return driver[0];
}

async function getOverTakingAbilityById(id) {
    const driver = await executeWithResult(OVERTAKINGABILITYSINGLEDRIVERQUERY, id);
    if (driver === undefined) throw new UnexistingResourceError("Invalid Driver ID");
    return driver[0];
}

async function getDriverVsTeammateById(id) {
    const driver = await executeWithResult(DRIVERVSTEAMMATESTATSQUERY, id);
    if (driver === undefined) throw new UnexistingResourceError("Invalid Driver ID");
    return driver[0];
}

async function getAllPositionsById(id) {
    const driver = await executeWithResult(ALLPOSITIONSSINGLEDRIVERQUERY, id);
    if (driver === undefined) throw new UnexistingResourceError("Invalid Driver ID");
    const driverData = {
        driver_id: driver[0]?.driver_id || id,
        positions: {}
    };

    driver.forEach(pos => {
        driverData.positions[pos.position] = pos.count;
    });
    return driverData;
}

export {
    getAllDrivers,
    getDriverFromId,
    create,
    update,
    remove,
    getTotalWinsById,
    getQualifyingStatsById,
    getOverTakingAbilityById,
    getDriverVsTeammateById,
    getAllPositionsById
};

