import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

const GETALLRESULTSQUERY = `
  SELECT
    re.*,
    r.race_id        AS r_race_id,
    r.race_name      AS r_race_name,
    r.season         AS r_season,
    r.round_num      AS r_round_num,
    r.date           AS r_date,
    r.time           AS r_time,
    r.circuit_id     AS r_circuit_id,

    d.driver_id      AS d_driver_id,
    d.givenName      AS d_givenName,
    d.familyName     AS d_familyName,
    d.dob            AS d_dob,
    d.nationality    AS d_nationality,

    c.constructor_id AS c_constructor_id,
    c.name           AS c_name,
    c.nationality    AS c_nationality,

    ci.circuit_id    AS ci_circuit_id,
    ci.name          AS ci_name,
    ci.lat           AS ci_lat,
    ci.\`long\`      AS ci_long,
    ci.locality      AS ci_locality,
    ci.country       AS ci_country,
    ci.wikipedia_url AS ci_wikipedia_url
  FROM results re
  JOIN races       r  ON re.race_id       = r.race_id
  JOIN drivers     d  ON re.driver_id     = d.driver_id
  JOIN constructors c ON re.constructor_id = c.constructor_id
  JOIN circuits    ci ON r.circuit_id     = ci.circuit_id
`.replaceAll("\n", "");
const SINGLERESULTQUERY = `
  SELECT
    re.*,
    r.race_id        AS r_race_id,
    r.race_name      AS r_race_name,
    r.season         AS r_season,
    r.round_num      AS r_round_num,
    r.date           AS r_date,
    r.time           AS r_time,
    r.circuit_id     AS r_circuit_id,

    d.driver_id      AS d_driver_id,
    d.givenName      AS d_givenName,
    d.familyName     AS d_familyName,
    d.dob            AS d_dob,
    d.nationality    AS d_nationality,

    c.constructor_id AS c_constructor_id,
    c.name           AS c_name,
    c.nationality    AS c_nationality,

    ci.circuit_id    AS ci_circuit_id,
    ci.name          AS ci_name,
    ci.lat           AS ci_lat,
    ci.\`long\`      AS ci_long,
    ci.locality      AS ci_locality,
    ci.country       AS ci_country,
    ci.wikipedia_url AS ci_wikipedia_url
  FROM results re
  JOIN races       r  ON re.race_id       = r.race_id
  JOIN drivers     d  ON re.driver_id     = d.driver_id
  JOIN constructors c ON re.constructor_id = c.constructor_id
  JOIN circuits    ci ON r.circuit_id     = ci.circuit_id
  WHERE re.race_id = ? AND re.driver_id = ?;
`.replaceAll("\n", "");
const CREATERESULTQUERY = "INSERT INTO `results` (`race_id`, `driver_id`, `constructor_id`, `grid`, `position`, `position_order`, `points`, `laps`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
const UPDATERESULTQUERY = `
  UPDATE results
  SET constructor_id = ?, grid = ?, position = ?, position_order = ?, points = ?, laps = ?, status = ?
  WHERE race_id = ? AND driver_id = ?;
`;

const DELETERESULTQUERY = `
  DELETE FROM results
  WHERE race_id = ? AND driver_id = ?;
`;
async function getAllResults() {
    const results = await executeWithResult(GETALLRESULTSQUERY);
    return results.map(mapResultRow)
}

async function getResultFromId(raceId, driverId) {
    const results = await executeWithResult(SINGLERESULTQUERY, raceId, driverId);
    const row = results[0];
    if (!row) throw new UnexistingResourceError("Invalid Result Id");
    return mapResultRow(row);
}

async function create(data) {
    if (!data) throw new BodyParsingError("Body cannot be empty");
    const { race_id, driver_id, constructor_id, grid, position, position_order, points, laps, status } = data;
    if ([race_id, driver_id, constructor_id, grid, position, position_order, points, laps, status].some(v => v === undefined)) {
        throw new BodyParsingError("Body must contain all result fields");
    }

    const existing = await getResultFromId(race_id, driver_id).catch(() => null);
    if (existing) throw new BodyParsingError("Result for this race and driver already exists");

    return executeWithoutResult(
        CREATERESULTQUERY,
        race_id, driver_id, constructor_id, grid, position, position_order, points, laps, status
    );
}

async function update(raceId, driverId, data) {
    if (!data) throw new BodyParsingError("Body cannot be empty");
    const { constructor_id, grid, position, position_order, points, laps, status } = data;
    if ([constructor_id, grid, position, position_order, points, laps, status].some(v => v === undefined)) {
        throw new BodyParsingError("Body must contain all result fields");
    }

    const affected = await executeWithoutResult(
        UPDATERESULTQUERY,
        constructor_id, grid, position, position_order, points, laps, status,
        raceId, driverId
    );
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
    return affected;
}

async function remove(raceId, driverId) {
    const affected = await executeWithoutResult(DELETERESULTQUERY, raceId, driverId);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
}

function mapResultRow(row) {
    const {
        // foreign keys from results we want to omit on top level
        race_id,
        driver_id,
        constructor_id,

        // race
        r_race_id,
        r_race_name,
        r_season,
        r_round_num,
        r_date,
        r_time,
        r_circuit_id,

        // driver
        d_driver_id,
        d_givenName,
        d_familyName,
        d_dob,
        d_nationality,

        // constructor
        c_constructor_id,
        c_name,
        c_nationality,

        // circuit
        ci_circuit_id,
        ci_name,
        ci_lat,
        ci_long,
        ci_locality,
        ci_country,
        ci_wikipedia_url,

        // everything else that belongs to the result row itself
        // (grid, position, position_order, points, laps, status)
        ...resultFields
    } = row;

    return {
        // Top-level = only the “pure result” fields
        grid: resultFields.grid,
        position: resultFields.position,
        position_order: resultFields.position_order,
        points: resultFields.points,
        laps: resultFields.laps,
        status: resultFields.status,

        race: {
            race_id: r_race_id ?? race_id,
            race_name: r_race_name,
            season: r_season,
            round_num: r_round_num,
            date: r_date,
            time: r_time,
            circuit_id: r_circuit_id
        },

        driver: {
            driver_id: d_driver_id ?? driver_id,
            givenName: d_givenName,
            familyName: d_familyName,
            dob: d_dob,
            nationality: d_nationality
        },

        constructor: {
            constructor_id: c_constructor_id ?? constructor_id,
            name: c_name,
            nationality: c_nationality
        },

        circuit: {
            circuit_id: ci_circuit_id,
            name: ci_name,
            lat: ci_lat,
            long: ci_long,
            locality: ci_locality,
            country: ci_country,
            wikipedia_url: ci_wikipedia_url
        }
    };
}



export { getAllResults, getResultFromId, create, update, remove}
