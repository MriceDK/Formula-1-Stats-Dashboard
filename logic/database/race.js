import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

const GETALLRACESQUERY = "SELECT * FROM `races`;";
const SINGLERACEQUERY = "SELECT * from `races` WHERE `race_id` = ?;";
const CREATERACEQUERY = "INSERT INTO `races` (`race_id`, `season`, `round_num`, `race_name`, `date`, `time`, `circuit_id`) VALUES (?, ?, ?, ?, ?);";
const UPDATERACEQUERY = "UPDATE `races` SET givenName = ?, familyName = ?, nationality = ?, dob = ? WHERE `race_id` = ?;";
const DELETERACEQUERY = "DELETE FROM `races` WHERE `race_id` = ?;";

async function getAllRaces() {
    return await executeWithResult(GETALLRACESQUERY);
}

async function getRaceFromId(id) {
    const race = await executeWithResult(SINGLERACEQUERY, id).then(results => results[0]);
    if (race === undefined) throw new UnexistingResourceError("Invalid Race Id");
    return race;
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
