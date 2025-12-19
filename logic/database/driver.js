import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

const GETALLDRIVERSQUERY = "SELECT * FROM `drivers`;";
const SINGLEDRIVERQUERY = "SELECT * from `drivers` WHERE `driver_id` = ?;";
const CREATEDRIVERQUERY = "INSERT INTO `drivers` (`driver_id`, `givenName`, `familyName`, `nationality`, `dob`) VALUES (?, ?, ?, ?, ?);";
const UPDATEDRIVERQUERY = "UPDATE `drivers` SET givenName = ?, familyName = ?, nationality = ?, dob = ? WHERE `driver_id` = ?;";
const DELETEDRIVERQUERY = "DELETE FROM `drivers` WHERE `driver_id` = ?;";

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

export { getAllDrivers, getDriverFromId, create, update, remove };