require("dotenv").config();

var mariadb = require("mariadb/callback");
var mariadbPromise = require("mariadb");

var pool = mariadb.createPool({
  connectionLimit: 10,
  host: process.env.MARIADB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  port: process.env.MARIADB_PORT,
});

var poolPromise = mariadbPromise.createPool({
  connectionLimit: 10,
  host: process.env.MARIADB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  port: process.env.MARIADB_PORT,
});

async function verificarConexion() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Conexión a la base de datos MariaDB establecida");
    return true;
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { pool, poolPromise, verificarConexion };
