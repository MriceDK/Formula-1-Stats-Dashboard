import {executeWithoutResult, executeWithResult} from "./data/connection.js";
import {BodyParsingError, UnexistingResourceError} from "../exceptions/errorhandling.js";

const GETALLCONSTRUCTORSQUERY = "SELECT * FROM `constructors`;";
const SINGLECONSTRUCTORQUERY = "SELECT * from `constructors` WHERE `constructor_id` = ?;";
const CREATECONSTRUCTORQUERY = "INSERT INTO `constructors` (`constructor_id`, `name`, `nationality`, `wikipedia_url`) VALUES (?, ?, ?, ?);";
const UPDATECONSTRUCTORQUERY = "UPDATE `constructors` SET name = ?, nationality = ?, wikipedia_url = ? WHERE `constructor_id` = ?;";
const DELETECONSTRUCTORQUERY = "DELETE FROM `constructors` WHERE `constructor_id` = ?;";

async function getAllConstructors() {
    return await executeWithoutResult(GETALLCONSTRUCTORSQUERY);
}

async function getConstructorFromId(id) {
    const constructor = await executeWithResult(SINGLECONSTRUCTORQUERY, id).then(results => results[0]);
    if (constructor === undefined) throw new UnexistingResourceError("Invalid Constructor ID");
    return constructor;
}

async function create(data) {
    if (data === undefined)
        throw new BodyParsingError("Body cannot be empty");
    const { constructor_id, name, nationality, wikipedia_url } = data;
    if (constructor_id === undefined || name === undefined )
        throw new BodyParsingError("Body must contain all constructor fields");
    return await executeWithoutResult(CREATECONSTRUCTORQUERY, constructor_id, name, nationality, wikipedia_url);
}

async function update(id, data) {
    if (data === undefined) throw new BodyParsingError("Body cannot be empty");
    const { name, nationality, wikipedia_url } = data;
    if (name === undefined)
        throw new BodyParsingError("Body must contain all constructor fields");
    const affected = await executeWithoutResult(UPDATECONSTRUCTORQUERY, name, nationality, wikipedia_url, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
    return affected;
}

async function remove(id) {
    const affected = await executeWithoutResult(DELETECONSTRUCTORQUERY, id);
    if (affected === 0) throw new UnexistingResourceError("Invalid id");
}

export { getAllConstructors, getConstructorFromId, create, update, remove };