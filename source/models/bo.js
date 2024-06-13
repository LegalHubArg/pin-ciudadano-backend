const { parseOptionDataType } = require("mariadb/lib/config/connection-options");
var connection = require("../services/conexion-mariadb");
let moment = require('moment')

async function traerBoletinesPublicados(request) {
    let conn = await connection.poolPromise.getConnection();
    let res = {};
    try {
        await conn.beginTransaction();
        let ultimaPublicacion;
        if (!request.fechaPublicacion && !request.numeroBoletin) {
            ultimaPublicacion = await conn.query(`SELECT MAX(a.fechaPublicacion) AS fecha FROM bo_boletines_publicados a 
                LEFT OUTER JOIN bo_boletines_estados g ON a.idBoletin=g.idBoletin 
                WHERE a.estado=1 AND g.estado=1 AND (g.idBoletinEstadoTipo=4 OR g.idBoletinEstadoTipo=6)`)
            ultimaPublicacion[0].fecha = moment(ultimaPublicacion[0].fecha).format('YYYY-MM-DD HH:mm:ss')
        }

        let sql = `SELECT a.archivoBoletin, 
        a.numeroBoletin, a.idBoletin, c.idNorma, z.archivoPublicado, a.fechaPublicacion, 
        c.idSeccion, c.idReparticion, c.reparticiones,
        c.idNormaTipo, c.idNormaSubtipo, c.normaNumero, c.normaAnio, d.seccion, e.normaTipo, c.organismoEmisor, c.normaSumario, c.siglasReparticiones
        FROM normas_metadatos c
            LEFT OUTER JOIN bo_boletines_normas z ON z.idNorma = c.idNorma
            LEFT OUTER JOIN bo_boletines_publicados a ON a.idBoletin=z.idBoletin
            LEFT OUTER JOIN bo_boletines_estados g ON a.idBoletin=g.idBoletin
            LEFT OUTER JOIN bo_sumario_secciones d ON c.idSeccion=d.idSeccion
            LEFT OUTER JOIN bo_normas_tipos e ON c.idNormaTipo=e.idNormaTipo
            LEFT OUTER JOIN bo_normas_subtipos f ON c.idNormaSubtipo=f.idNormaSubtipo
            LEFT OUTER JOIN bo_reparticiones repa ON c.idReparticion=repa.idReparticion
            WHERE c.estado=1 AND
            ${request.fechaPublicacion ? `a.fechaPublicacion='${moment(request.fechaPublicacion).format('YYYY-MM-DD HH:mm:ss')}'` :
                request.numeroBoletin ? `a.numeroBoletin='${request.numeroBoletin}'` :
                    `a.fechaPublicacion='${ultimaPublicacion[0].fecha}'`}
            AND a.estado=1 AND (g.idBoletinEstadoTipo=4 OR g.idBoletinEstadoTipo=6) AND g.estado=1
            ORDER BY c.idSeccion ASC, c.idNormaTipo ASC, c.idReparticion ASC;
        `;

        const bo = await conn.query(sql)
        let anexos = [];
        if (bo.length > 0) {
            anexos = await conn.query(`SELECT *,
                CASE
                    WHEN normaAnexoArchivoS3Key IS NOT NULL AND normaAnexoArchivoS3Key <> ''
                        THEN normaAnexoArchivoS3Key
                    ELSE NULL
                END AS link
                FROM normas_anexos
                WHERE idNorma IN (${bo.map(n => n.idNorma).join(',')}) AND estado=1`);
        }
        //const anexos = await conn.query(`SELECT * FROM normas_anexos WHERE idNorma IN (${bo.map(n => n.idNorma).join(',')}) AND estado=1`)
        let separatas = [];
        if (bo.length > 0 && bo[0].idBoletin) {
            separatas = await conn.query(`SELECT *, archivoS3 AS link FROM bo_boletines_anexos WHERE idBoletin IN (${bo[0].idBoletin})`);
        }
        //const separatas = await conn.query(`SELECT * FROM bo_boletines_anexos WHERE idBoletin IN (${bo[0].idBoletin})`);
        for (let i = 0; i < bo.length; i++) {
            bo[i].anexos = anexos.filter(n => n.idNorma === bo[i].idNorma)
        }
        res = { bo, separatas }
        console.log(sql)

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        if (conn) conn.close();
    }
    return res
}

function traerSeccionesBoletines(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * 
                FROM bo_sumario_secciones
                WHERE estado=1; 
            `;
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
}

function traerTiposNormas(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * 
                FROM bo_normas_tipos
                WHERE estado=1; 
            `;
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
}

function traerSubtiposNormas(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * 
                FROM bo_normas_subtipos
                WHERE estado=1; 
            `;
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
}

function traerReparticiones(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * 
                FROM bo_reparticiones
                WHERE estado=1; 
            `;
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
}

function traerOrganismos(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * 
                FROM bo_organismos_emisores; 
            `;
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
}

function traerNormasBAC(request) {
    return new Promise((resolve, reject) => {



        let sql = `SELECT UPPER(CONCAT(n.numeroReparto, "-",LPAD(n.normaNumero, 4, 0),"-", n.procedimiento)) AS nro_bac, nst.normaSubtipo As sub_tipo_norma, bm.numeroBoletin, DATE(bm.fechaPublicacion) as fechaP, n.idNorma AS id, n.fechaCarga as fecha_ingreso, cta.sigla AS usuario, nt.normaTipo
        FROM normas_metadatos n, bo_normas_tipos nt, bo_cuentas cta, bo_boletines_normas bn, bo_boletines_publicados bm, bo_normas_subtipos nst
    WHERE
    1=1
    AND n.idNormaTipo = ` + request.idNormaTipo + `
    AND n.idNormaSubtipo = `+ request.idNormaSubtipo + `
    AND 
    UPPER(CONCAT(n.numeroReparto, "-",LPAD(n.normaNumero, 4, 0),"-", n.procedimiento)) = UPPER("`+ request.numeroBAC + `")
    AND n.idNormaTipo = nt.idNormaTipo
AND n.idCuentaCarga = cta.idCuenta
AND n.idNorma = bn.idNorma
AND bn.idBoletin = bm.idBoletin
AND n.idNormaSubtipo = nst.idNormaSubtipo
    `;

        params = []
        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            // Use the connection
            conn.query(sql, params, function (error, results, fields) {
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

}

async function traerBoletines(request) {
    let conn = await connection.poolPromise.getConnection();
    let res = {};
    try {
        await conn.beginTransaction();

        let sql = `SELECT a.numeroBoletin, c.fechaPublicacion, c.idSeccion, c.idReparticion, c.idNormaTipo, 
                    c.idNormaSubtipo, c.normaNumero, c.normaAnio, c.normaSumario, c.organismoEmisor,
                    a.idBoletin, c.idNorma, c.mig_filenet_publicado AS archivoNorma, b.seccion, d.normaTipo, 
                    e.normaSubtipo, f.reparticion, z.archivoPublicado
                    FROM normas_metadatos c
                    LEFT OUTER JOIN bo_boletines_normas z ON z.idNorma = c.idNorma
                    LEFT OUTER JOIN bo_boletines_publicados a ON a.idBoletin=z.idBoletin
                    LEFT OUTER JOIN bo_sumario_secciones b ON c.idSeccion=b.idSeccion
                    LEFT OUTER JOIN bo_normas_tipos d ON c.idNormaTipo=d.idNormaTipo 
                    LEFT OUTER JOIN bo_normas_subtipos e ON c.idNormaSubtipo=e.idNormaSubtipo
                    LEFT OUTER JOIN bo_reparticiones f ON c.idReparticion=f.idReparticion
                    WHERE c.estado=1 AND a.estado=1

        `;
        let params = [];

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('idNormaTipo'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('idReparticion'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('idSeccion'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('idNormaSubtipo'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('normaNumero'):
                    sql = `${sql} AND c.${key}='${value}'`;
                    break;
                case ('normaAnio'):
                    sql = `${sql} AND c.${key}='${value}'`;
                    break;
                case ('organismoEmisor'):
                    sql = `${sql} AND c.${key}='${value}'`;
                    break;
                case ('numeroBoletin'):
                    sql = `${sql} AND a.${key}='${value}'`;
                    break;
                case ('fechaPublicacionDesde'):
                    sql = `${sql} AND a.fechaPublicacion >= '${request.fechaPublicacionDesde}'`;
                    break;
                case ('fechaPublicacionHasta'):
                    sql = `${sql} AND a.fechaPublicacion <= '${request.fechaPublicacionHasta}'`;
                    break;
                case 'palabras':
                    sql = `${sql} AND c.normaSumario LIKE '%${value}%'`;
                    break;

            }
            //sql = `${sql} LIMIT 10`;
        }
        
        sql += ` ORDER BY c.idSeccion ASC, c.idNormaTipo ASC, c.idReparticion ASC `;
        
        let count = await conn.query('SELECT COUNT(c.idSeccion) FROM' + sql.split('FROM')[1], params)
        res.totalBoletines = count[0]['COUNT(c.idSeccion)']
        
        //Paginacion
        sql += ` LIMIT ${request.limite} OFFSET ${request.offset}`
        
        res.normas = await conn.query(sql, params);

        let anexos = [];
        if (res.normas.length > 0) {
            anexos = await conn.query(`SELECT *,
                CASE
                    WHEN normaAnexoArchivoS3Key IS NOT NULL AND normaAnexoArchivoS3Key <> ''
                        THEN normaAnexoArchivoS3Key
                    ELSE NULL
                END AS link
                FROM normas_anexos
                WHERE idNorma IN (${res.normas.map(n => n.idNorma).join(',')}) AND estado=1`);
        }
        for (let i = 0; i < res.normas.length; i++) {
            res.normas[i].anexos = anexos.filter(n => n.idNorma === res.normas[i].idNorma)
        }

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        if (conn) conn.close();
    }
    return res
}

function traerSeparatas(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_boletines_anexos WHERE idBoletin=?`;

        connection.pool.query(sql, [request.idBoletin], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = {
    traerBoletinesPublicados,
    traerSeccionesBoletines,
    traerTiposNormas,
    traerSubtiposNormas,
    traerReparticiones,
    traerNormasBAC,
    traerOrganismos,
    traerBoletines,
    traerSeparatas
}