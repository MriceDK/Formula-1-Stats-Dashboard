import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

const GETALLCIRCUITSQUERY = "SELECT * FROM `circuits`;";
const SINGLECIRCUITQUERY = "SELECT * from `circuits` WHERE `circuit_id` = ?;";
const CREATECIRCUITQUERY = "INSERT INTO `circuits` (`circuit_id`, `name`, `lat`, `long`, `locality`, `country`, `Wikipedia_url`) VALUES (?, ?, ?, ?, ?, ?, ?);";
const UPDATECIRCUITQUERY = "UPDATE `circuits` SET name = ?, lat = ?, long = ?, locality = ?, country = ?, Wikipedia_url = ? WHERE `circuit_id` = ?;";
const DELETECIRCUITQUERY = "DELETE FROM `circuits` WHERE `circuit_id` = ?;";

async function getAllCircuits() {
    let result = await executeWithResult(GETALLCIRCUITSQUERY);
    return result;
}

async function getCircuitFromId(id) {
    const circuit = await executeWithResult(SINGLECIRCUITQUERY, id).then(results => results[0]);
    if (circuit === undefined) throw new UnexistingResourceError("Invalid Circuit ID");
    return circuit;
}

async function create(data) {
    if (data === undefined)
        throw new BodyParsingError("Body cannot be empty");
    const { circuit_id, name, lat, long, locality, country, Wikipedia_url } = data;
    if (circuit_id === undefined || name === undefined )
        throw new BodyParsingError("Body must contain all circuit fields");
    return await executeWithoutResult(CREATECIRCUITQUERY, circuit_id, name, lat, long, locality, country, Wikipedia_url);
}

async function update(id, data) {
    if (data === undefined) throw new BodyParsingError("Body cannot be empty");
    const { name, lat, long, locality, country, Wikipedia_url } = data;
    if (name === undefined)
        throw new BodyParsingError("Body must contain all circuit fields");
    const affected = await executeWithoutResult(UPDATECIRCUITQUERY, name, lat, long, locality, country, Wikipedia_url, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
    return affected;
}

async function remove(id) {
    const affected = await executeWithoutResult(DELETECIRCUITQUERY, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
}

export { getAllCircuits, getCircuitFromId, create, update, remove };