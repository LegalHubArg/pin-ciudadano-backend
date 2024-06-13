var connection = require("../services/conexion-mariadb");

async function traerNormas(request) {
    let conn = await connection.poolPromise.getConnection();
    let res = {};
    try {
        await conn.beginTransaction();

        let sql = `SELECT a.idNormaFinal, a.idNormaSDIN, a.importadaBO, a.normaAcronimoReferencia, a.idNormaTipo, b.normaTipo,
        a.idNormaSubtipo, c.normaSubtipo, a.idSeccion, a.idReparticion, d.reparticion, a.idReparticionOrganismo, 
        e.reparticion AS organismo, a.normaAnio, a.normaNumero, a.normaSumario, a.temasGenerales,
        a.vigente, a.idTipoPublicacion, a.fechaPublicacion, a.fechaSancion, a.textoOriginal, a.textoActualizado, 
        a.textoConsolidado, a.archivo, a.archivoS3, a.titulo, a.idRama, f.rama
        FROM final_normas a 
        LEFT OUTER JOIN normas_tipos b ON a.idNormaTipo=b.idNormaTipo
        LEFT OUTER JOIN normas_subtipos c ON a.idNormaSubtipo=c.idNormaSubtipo
        LEFT OUTER JOIN org_reparticiones d ON a.idReparticion=d.idReparticion
        LEFT OUTER JOIN org_reparticiones e ON a.idReparticionOrganismo=e.idReparticion
        LEFT OUTER JOIN sdin_ramas f ON a.idRama=f.idRama
        WHERE a.fechaCorte=(SELECT MAX(fechaCorte) AS fechaCorte FROM final_normas) `

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case 'vigente':
                    if (value !== 'Todos') {
                        sql += ` AND a.${key}=${value}`
                    }
                    break;
                case 'idNormaTipo':
                case 'normaNumero':
                case 'normaAnio':
                case 'idRama':
                    sql += ` AND a.${key}=${value}`
                    break;
                case 'texto':
                    if (request.textoSoloSumario) sql += ` AND a.normaSumario LIKE '%${request.texto}%'`
                    else sql += ` AND (a.normaSumario LIKE '%${request.texto}%' 
                    OR a.temasGenerales LIKE '%${request.texto}%' OR a.textoOriginal LIKE '%${request.texto}%'
                    OR a.textoConsolidado LIKE '%${request.texto}% OR a.textoActualizado LIKE '%${request.texto}%')`
                    break;
                case ('idTema'):
                    sql += ` AND a.idNormaFinal IN (SELECT idNormaHijo FROM final_temas_jerarquia WHERE idTema=${request.idTema})`;
                    break;
                case 'boletinNumero':
                    sql += ` AND a.idNorma IN (
                        SELECT idNorma FROM normas_publicadas WHERE boletinNumero=${request.boletinNumero} AND estado=1
                        )`;
                    break;
                case 'fechaPublicacionDesde':
                    sql += ` AND a.fechaPublicacion >= '${request.fechaPublicacionDesde}'`
                    break;
                case 'fechaPublicacionHasta':
                    sql += ` AND a.fechaPublicacion <= '${request.fechaPublicacionHasta}'`
                    break;

            }
        }
        
        let count = await conn.query('SELECT COUNT(a.idNormaFinal) FROM final_normas a WHERE' + sql.split(/WHERE(.*)/s)[1])
        res.totalNormas = count[0]['COUNT(a.idNormaFinal)']

        //Paginacion
        sql += ` LIMIT ${request.limite} OFFSET ${request.offset}`

        res.normas = await conn.query(sql)

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

function traerRamas() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_ramas WHERE estado=1;`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerTemas() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_temas WHERE estado=1;`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerUnaNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.idNormaSDIN, a.importadaBO, a.normaAcronimoReferencia, a.idNormaTipo, b.normaTipo,
        a.idNormaSubtipo, c.normaSubtipo, a.idSeccion, a.idReparticion, d.reparticion, a.idReparticionOrganismo, 
        e.reparticion AS organismo, a.normaAnio, a.normaNumero, a.normaSumario, a.temasGenerales,
        a.vigente, a.idTipoPublicacion, a.fechaPublicacion, a.fechaSancion, a.textoOriginal, a.textoActualizado, 
        a.textoConsolidado, a.archivo, a.archivoS3, a.titulo, a.idRama, f.rama
        FROM final_normas a 
        LEFT OUTER JOIN normas_tipos b ON a.idNormaTipo=b.idNormaTipo
        LEFT OUTER JOIN normas_subtipos c ON a.idNormaSubtipo=c.idNormaSubtipo
        LEFT OUTER JOIN org_reparticiones d ON a.idReparticion=d.idReparticion
        LEFT OUTER JOIN org_reparticiones e ON a.idReparticionOrganismo=e.idReparticion
        LEFT OUTER JOIN sdin_ramas f ON a.idRama=f.idRama
        WHERE a.idNormaFinal=? AND a.estado=1;`;

        connection.pool.query(sql, [request.idNorma], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function arbolTematico() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM dj_arbol_tematico`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerUltimoDigesto() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.* FROM dj_anexos_firmados a
            LEFT OUTER JOIN final_cortes b ON a.fechaDigesto=b.fechaCorte
            WHERE b.fechaCorte=(
                SELECT MAX(fechaCorte) FROM final_cortes WHERE aprobadoLegislatura=1 AND enviadoLegislatura=1
                )`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}


module.exports = { traerNormas, traerRamas, traerTemas, traerUnaNorma, arbolTematico, traerUltimoDigesto }