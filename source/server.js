const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const routes = require("./routes/rutas");
const morgan = require("morgan");
const { verificarConexion } = require("./services/conexion-mariadb");

const port = process.env.API_PORT;

//app.listen(process.env.API_PORT, () => { console.log('Listening on 9000') })

const apiversion = "/api/" + process.env.API_VERSION;

// const whitelist = process.env.API_WHITELIST.split(',')
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
      console.log("CORS OK FROM: ", origin);
    } else {
      callback(new Error("Not allowed by CORS"));
      console.log("CORS ERROR FROM: ", origin);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
console.log("testing push")

app.use(bodyParser.json());

//Logger
app.use(morgan("dev"));

//HEALTH
verificarConexion();
async function pinrun(req, res) {
  res.status(200);
  res.send(JSON.stringify({ status: "OK" }));
  res.end();
}
app.get(apiversion + "/pin-run", pinrun);
//Rutas
app.use(apiversion, routes);

app.use("*", (req, res) => {
  res.status(404);
  //res.send(JSON.stringify({ mensaje: 'PIN: Ruta inválida.', error: 'Petición no permitida.' }))
  res.end();
});

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;

  console.log("Frontoffice Backend Running in " + bind + "...");
}
