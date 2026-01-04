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
    const conn = await openConnection();
    const results = await conn.query(query, params).then(convertToJsonObject);
    conn.end();
    return results;
}

async function executeWithoutResult(query, ...params) {
    const conn = await openConnection();
    const result = await conn.query(query, params);
    conn.end();
    return result.affectedRows;
}

export { executeWithResult, executeWithoutResult };