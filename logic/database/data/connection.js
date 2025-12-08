import mysql from "promise-mysql";
import * as dotenv from 'dotenv';

dotenv.config();

function openConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
    });
}

function convertToJsonObject(sqlResult) {
    return sqlResult.map(row => Object.fromEntries(Object.entries(row)));
}

async function executeWithResult(query, ...params) {
    const conn = await openConnection(); //open a new connection
    const results = await conn.query(query, params).then(convertToJsonObject); //execute the query with the given parameters and convert the result
    conn.end(); //close the connection, important to avoid DDOS attacks
    return results;
}

async function executeWithoutResult(query, ...params) {
    const conn = await openConnection(); //open a new connection
    const result = await conn.query(query, params); //execute the query with the given parameters
    conn.end();
    return result.affectedRows; //used to check if the query succeeded
}

export { executeWithResult, executeWithoutResult };