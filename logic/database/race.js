import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

const GETALLRACESQUERY = `
  SELECT r.*, 
      c.circuit_id AS c_circuit_id, 
      c.name AS c_name,
      c.lat AS c_lat, 
      c.\`long\` AS c_long,
      c.locality AS c_locality, 
      c.country AS c_country,
      c.wikipedia_url AS c_wikipedia_url
  FROM races r
  JOIN circuits c ON r.circuit_id = c.circuit_id;
`;
const SINGLERACEQUERY = `
  SELECT r.*, c.circuit_id AS c_circuit_id, c.name AS c_name,
         c.lat AS c_lat, c.\`long\` AS c_long,
         c.locality AS c_locality, c.country AS c_country,
         c.wikipedia_url AS c_wikipedia_url
  FROM races r
  JOIN circuits c ON r.circuit_id = c.circuit_id
  WHERE r.race_id = ?;
`;
const CREATERACEQUERY = "INSERT INTO `races` (`race_id`, `season`, `round_num`, `race_name`, `date`, `time`, `circuit_id`) VALUES (?, ?, ?, ?, ?, ?, ?);";
const UPDATERACEQUERY = "UPDATE `races` SET season = ?, round_num = ?, race_name = ?, date = ?, time = ?, circuit_id = ? WHERE `race_id` = ?;";
const DELETERACEQUERY = "DELETE FROM `races` WHERE `race_id` = ?;";

async function getAllRaces() {
    const races = await executeWithResult(GETALLRACESQUERY);
    return races.map(mapRaceRow);
}

function mapRaceRow(row) {

    const {
        circuit_id,
        c_circuit_id, c_name, c_lat, c_long,
        c_locality, c_country, c_wikipedia_url,
        ...raceFields
    } = row;

    return {
        ...raceFields,
        circuit: {
            circuit_id: c_circuit_id,
            name: c_name,
            lat: c_lat,
            long: c_long,
            locality: c_locality,
            country: c_country,
            wikipedia_url: c_wikipedia_url
        }
    };
}

async function getRaceFromId(id) {
    const race = await executeWithResult(SINGLERACEQUERY, id).then(results => results[0]);
    if (race === undefined) throw new UnexistingResourceError("Invalid Race Id");
    return mapRaceRow(race);
}

async function create(data) {

    if (data === undefined)
        throw new BodyParsingError("Body cannot be empty");
    const { race_id, season, round_num, race_name, date, time, circuit_id } = data;
    if (race_id === undefined || season === undefined || round_num === undefined || race_name === undefined || date === undefined || circuit_id === undefined)
        throw new BodyParsingError("Body must contain all race fields");
    const existingRace = await getRaceFromId(race_id).catch(() => null);
    if (existingRace !== null) throw new BodyParsingError("Race ID already exists");
    return await executeWithoutResult(CREATERACEQUERY, race_id, season, round_num, race_name, date, time, circuit_id);
}

async function update(id, data) {
    if (data === undefined) throw new BodyParsingError("Body cannot be empty");
    const { season, round_num, race_name, date, time, circuit_id } = data;
    if (season === undefined || round_num === undefined || race_name === undefined || date === undefined || circuit_id === undefined)
        throw new BodyParsingError("Body must contain all   race fields");
    const affected = await executeWithoutResult(UPDATERACEQUERY, season, round_num, race_name, date, time, circuit_id, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
    return affected;
}

async function remove(id) {
    const affected = await executeWithoutResult(DELETERACEQUERY, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
}

export { getAllRaces, getRaceFromId, create, update, remove };
