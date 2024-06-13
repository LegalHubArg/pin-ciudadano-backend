var connection = require("../services/conexion-mariadb");

function traerContenido(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM pin_contenido WHERE seccion=?`;

        connection.pool.query(sql, [request.seccion], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

/* function traerContenido(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM pin_contenido`;
        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            // Use the connection
            conn.query(sql, function (error, results, fields) {
                conn.release();
                if (err) {
                    reject(err);
                }
                resolve(results);

                // Handle error after the release.
                if (error) throw error;
            });
        });
    });
} */

module.exports = { traerContenido }