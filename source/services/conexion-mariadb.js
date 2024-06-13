require('dotenv').config()

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

module.exports = {pool, poolPromise};