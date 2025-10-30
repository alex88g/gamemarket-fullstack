// db.js
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()


export const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
connectionLimit: 10,
namedPlaceholders: true,
})


// Hjälpfunktion (valfri) för att testa DB vid start
export async function assertDbConnection() {
const conn = await pool.getConnection()
try {
await conn.ping()
} finally {
conn.release()
}
}