var connection = require("../services/conexion-mariadb");

async function traerNormas(request) {
    let conn = await connection.poolPromise.getConnection();
    let res = {};
    try {
        await conn.beginTransaction();

        let sql = `SELECT a.alcance, a.firmantes, a.idNormaFront, a.fechaCarga, 
        a.temasGenerales, a.normaNumero, a.normaAnio, a.normaSumario, a.idNormaSDIN,
        d.seccionSigla, a.importadaBO, f.normaTipo, a.idNorma,
        a.fechaSancion, sdin_temas.tema, sdin_ramas.rama, a.fechaRatificacion, a.fechaPublicacion, a.fechaPromulgacion, dep.dependencia, dep.idDependencia, 
        dep.sigla AS siglaDependencia, org.idOrganismo,  org.organismo, org.sigla AS siglaOrganismo,
        i.valoresFormulario6, k.idTextoDefinitivo, k.textoDefinitivo
        FROM sdin_normas_front a 
        LEFT OUTER JOIN bo_sumario_secciones d ON a.idSeccion = d.idSeccion
        LEFT OUTER JOIN sdin_normas_tipos f ON a.idNormaTipo = f.idNormaTipo
        LEFT OUTER JOIN sdin_dependencias dep ON a.idReparticion = dep.idDependencia
        LEFT OUTER JOIN sdin_organismos org ON a.idReparticionOrganismo = org.idOrganismo
        LEFT OUTER JOIN sdin_ramas ON sdin_ramas.idRama = a.idRama
        LEFT OUTER JOIN sdin_clases g ON a.idClase = g.idClase
        LEFT OUTER JOIN sdin_gestiones h ON a.idGestion = h.idGestion
        LEFT OUTER JOIN dj_analisis_epistemologico i ON a.idNormaSDIN=i.idNormaSDIN
        LEFT OUTER JOIN dj_texto_definitivo k ON i.valoresFormulario6=k.idTextoDefinitivo
        LEFT OUTER JOIN sdin_normas_front_textos_actualizados b ON a.idNormaFront=b.idNormaFront 
        LEFT OUTER JOIN sdin_normas_front_textos_originales c ON a.idNormaFront=c.idNormaFront
        LEFT OUTER JOIN normas_metadatos e ON a.idNorma=e.idNorma
        LEFT OUTER JOIN sdin_temas_jerarquia l ON a.idNormaFront=l.idNormaHijo
        LEFT OUTER JOIN sdin_temas ON l.idTema=sdin_temas.idTema
        LEFT OUTER JOIN sdin_normas_relaciones rel ON rel.idNormaOrigen = a.idNormaFront
        LEFT OUTER JOIN sdin_relaciones_tipos rel_tipo ON rel.idRelacion = rel_tipo.idRelacion
        WHERE 1=1
        `;
        let params = [];

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('idNormaTipo'):
                    sql += ` AND f.${key}=?`;
                    params.push(value)
                    break;
                case ('idOrganismo'):
                    sql = String(sql) + String(` AND org.${key}=${value}`);
                    break;
                /* case ('idDependencia'):
                    sql = String(sql) + String(` AND dep.${key}=${value}`);
                    break; */
                case ('dependencias'):
                        if (request.dependencias.dependencias?.length > 0) {
                            let condicion = request.dependencias.dependencias.map(n=>`dep.idDependencia = ${n}`).join(' OR ' )
                            sql += `AND (${condicion})`
                        }
                        break;
                case ('idRelacion'):
                    sql = String(sql) + String(` AND rel_tipo.${key}=${value} AND rel.estado = 1`);
                    break;
                case ('normaNumero'):
                    sql = `${sql} AND a.${key}='${value}'`;
                    break;
                case ('normaAnio'):
                    //sql = `${sql} AND a.${key}='${value}'`;
                    sql = `${sql} AND RIGHT(YEAR(a.fechaSancion), 2) ='${value}'`;
                    break;
                case ('alcance'):
                    sql = `${sql} AND a.${key}='${value}'`;
                    break;
                case ('idClase'):
                    sql = String(sql) + String(` AND a.${key}=${value}`);
                    break;
                case ('idGestion'):
                    sql = String(sql) + String(` AND h.${key}=${value}`);
                    break;
                case ('temas'):
                    sql = `${sql} AND sdin_temas.idTema = ${request.temas}`;
                    /* if (request.temas?.length > 0) {
                        sql += `AND a.idNormaSDIN IN (SELECT idNormaHijo FROM sdin_temas_jerarquia WHERE idTema=(${request.temas}))`;
                    } */
                    break;
                case ('fechaSancionDesde'):
                    sql = `${sql} AND DATE(a.fechaSancion) >= '${request.fechaSancionDesde}'`;
                    break;
                case ('fechaSancionHasta'):
                    sql = `${sql} AND DATE(a.fechaSancion) <= '${request.fechaSancionHasta}'`;
                    break;
                case ('fechaPublicacionDesde'):
                    sql = `${sql} AND DATE(a.fechaPublicacion) >= '${request.fechaPublicacionDesde}'`;
                    break;
                case ('fechaPublicacionHasta'):
                    sql = `${sql} AND DATE(a.fechaPublicacion) <= '${request.fechaPublicacionHasta}'`;
                    break;
                case 'textoSum':
                    sql = `${sql} AND a.normaSumario LIKE '%${value}%'`;
                    break;
                case 'textoCont':
                    sql = `${sql} AND k.textoDefinitivo LIKE CONCAT('%${value}%')`;
                    break;
                case 'textoSumario':
                    sql = `${sql} AND a.normaSumario = '${value}'`;
                    break;
                case 'textoContenido':
                    sql = `${sql} AND k.textoDefinitivo LIKE CONCAT('%${value}%')`;
                    break;
                case 'vigente':
                    sql += ` AND a.vigente=?`;
                    break;
                case 'sinSumario':
                    {
                        const words = value.split(' ');
                        const wordConditions = words.map(word => `a.normaSumario NOT LIKE '%${word}%'`);
                        const condition = wordConditions.join(' AND ');
                        sql = `${sql} AND (${condition})`;
                    }
                    break;
                case 'sinContenido':
                    {
                        const words = value.split(' ');
                        const wordConditions = words.map(word => `k.textoDefinitivo NOT LIKE CONCAT('%', ?, '%')`);
                        const condition = wordConditions.join(' AND ');
                        sql = `${sql} AND (${condition})`;
                        params.push(...words); // Agregar palabras como parámetros
                    }
                    break;
                case ('textoConsolidado'):
                    if (request.textoConsolidado) {
                        sql += ` AND c.textoOriginal IS NOT NULL`;
                    }
                    break;
                case ('textoActualizado'):
                    if (request.textoActualizado) {
                        sql += ` AND b.textoActualizado IS NOT NULL`;
                    }
                    break;
                case ('estado'):
                    if (value === 1) {
                        sql = String(sql) + String(` AND a.vigente=${value}`);
                    } else {
                        sql = String(sql) + String(` AND a.vigente=0`);
                    }
                    break;
                case 'tematica':
                    sql = `${sql} AND sdin_temas.idTema = ${request.tematica}`;
                    break;
                case 'rama':
                    //sql = `${sql} AND sdin_ramas.rama LIKE CONCAT('%${value}%')`;
                    sql = `${sql} AND sdin_ramas.rama = '${value}'`;
                    break;
                case 'textoBO':
                    sql = `${sql} AND e.normaSumario LIKE CONCAT('%${value}%')`;
                    break;
            }
        }
        
        let count = await conn.query('SELECT COUNT(a.idNormaFront) FROM' + sql.split('FROM')[1], params)
        res.totalNormas = count[0]['COUNT(a.idNormaFront)']

        //Paginacion
        sql += ` LIMIT ? OFFSET ?`;
        params.push(request.limite, request.offset)
        res.normas = await conn.query(sql, params);
        await conn.commit();
    }
    catch (err) {
        console.log(err)
        await conn.rollback();
        throw err;
    }
    finally {
        if (conn) conn.close();
    }
    return res
}

async function traerUnaNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    let res = {};
    try {
        await conn.beginTransaction();
        let sql = `SELECT a.*, b.normaTipo, f.rama, i.archivoPublicado, e.mig_filenet_publicado, dc.causal, dpn.nombre as patologia,
        c.textoOriginal, g.archivoS3 AS archivoTextoActualizadoS3, d.valoresFormulario6, h.idTextoDefinitivo, 
        h.textoDefinitivo, org.organismo, h.archivo as archivoConsolidado, h.archivoS3 as ArchivoConsolidadoS3,
            CASE 
                WHEN a.mostrarRamaTema = 1 
                    THEN f.rama
                ELSE NULL 
            END AS ramaCheck, 
            CASE 
                WHEN a.mostrarTA = 1 
                    THEN  g.archivo
                ELSE NULL 
            END AS archivoTextoActualizado, 
            CASE 
                WHEN a.mostrarTA = 1 
                    THEN  g.textoActualizado
                ELSE NULL 
            END AS textoActualizado
            FROM sdin_normas_front a 
            LEFT OUTER JOIN sdin_normas_tipos b ON a.idNormaTipo=b.idNormaTipo
            LEFT OUTER JOIN sdin_ramas f ON a.idRama=f.idRama
            LEFT OUTER JOIN normas_metadatos e ON a.idNorma=e.idNorma
            LEFT OUTER JOIN sdin_normas_front_textos_originales c ON a.idNormaSDIN=c.idNormaFront
            LEFT OUTER JOIN sdin_normas_front_textos_actualizados g ON a.idNormaSDIN=g.idNormaFront
            LEFT OUTER JOIN dj_analisis_epistemologico d ON a.idNormaSDIN=d.idNormaSDIN
            LEFT OUTER JOIN dj_texto_definitivo h ON d.valoresFormulario6=h.idTextoDefinitivo
            LEFT OUTER JOIN dj_causales dc ON dc.idCausal = a.idCausal
            LEFT OUTER JOIN dj_patologias_normativas dpn ON dpn.idPatologiaNormativa = a.idCausal
            LEFT OUTER JOIN sdin_organismos org ON org.idOrganismo = a.idReparticionOrganismo
            LEFT OUTER JOIN 
                (SELECT
                    idNorma,
                    MAX(archivoPublicado) AS archivoPublicado
                FROM
                    bo_boletines_normas
                GROUP BY idNorma) i
            ON a.idNorma = i.idNorma
            WHERE a.idNormaFront=? AND a.estado =1;`;

        res = await conn.query(sql, [request.idNorma])

        sql = `SELECT z.id AS idDocumentoAntecedente, z.idAntecedentesEquivalencias, z.idLeyDigesto, z.archivo, z.archivoS3, z.documentoConsolidado, m.anio
        FROM dj_analisis_epistemologico a
        LEFT OUTER JOIN dj_antecedentes_equivalencias i ON a.valoresFormulario7=i.idAntecedentesEquivalencias
        LEFT OUTER JOIN dj_antecedentes_equivalencias_documentos z ON i.idAntecedentesEquivalencias=z.idAntecedentesEquivalencias
        LEFT OUTER JOIN dj_leyes_digesto m ON z.idLeyDigesto = m.idLeyDigesto
        WHERE a.idNormaSDIN=?
        AND z.archivo != '' 
        AND z.archivo IS NOT NULL 
        AND z.archivoS3 != '' 
        AND z.archivoS3 IS NOT NULL
        `;

        if (res.length > 0) {
            res[0].antecedentes = await conn.query(sql, [request.idNorma])
        }

        // traer los anexos que tiene la norma:
        res.anexos = []
        let sqlAnexos = `SELECT an.idAnexoSDIN,
        f.idNormaSDIN,
        an.archivo AS ArchivoAnexo,
        an.archivoS3 AS ArchivoAnexoS3 
        FROM sdin_normas_anexos an
        LEFT OUTER JOIN sdin_normas_front f ON f.idNormaSDIN = an.idNormaSDIN
        WHERE f.idNormaSDIN = ?`

        // ejecuto la consulta
        let a = await conn.query(sqlAnexos, [request.idNorma])

        if (a.length > 0) {
            // saco los metadatos de la consulta:
            res.anexos = a.filter(anexo => !anexo.meta);
        }

        await conn.commit();
    }
    catch (err) {
        console.log(err)
        await conn.rollback();
        throw err;
    }
    finally {
        if (conn) conn.close();
    }
    return res

}

function traerImagenSDIN(request) {
    return new Promise((resolve, reject) => {
        let sql = ` SELECT a.*
        FROM sdin_imagenes a 
        WHERE a.idNorma = ? AND numero = ?`;

        connection.pool.query(sql, [request.idNorma, request.numero], function (error, results) {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    })
};

async function traerJerarquiaTemas() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*, b.tema AS tema, c.tema AS temaHijo 
            FROM sdin_temas_jerarquia a
            LEFT OUTER JOIN sdin_temas b ON a.idTema=b.idTema
            LEFT OUTER JOIN sdin_temas c ON a.idTemaHijo=c.idTema
            WHERE a.estado=1 AND a.idNormaHijo IS NULL;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function normaTiposSDIN() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_normas_tipos WHERE estado=1;`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerDependencias() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT *
        FROM sdin_dependencias
        WHERE estado = 1
        ORDER BY dependencia ASC`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerRelaciones() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT idRelacion,relacion FROM sdin_relaciones_tipos
        WHERE estado = 1
        ORDER BY relacion ASC`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerAlcances() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_alcances;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerClases() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_clases;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

// Comento esta funcion porque desde el frontoffice no debe haber acceo a los estados de las normas, es un dato interno
/* async function traerEstados() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT idNormasEstadoTipo, normasEstadoTipo FROM sdin_normas_estados_tipos WHERE habilitado=1;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
} */

async function traerGestiones() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT idGestion, nombre FROM sdin_gestiones WHERE estado=1;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerOrganismos() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_organismos WHERE estado=1;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerRelacionesDeNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*, b.relacion, b.descripcion, c.normaTipo, d.normaNumero
                    FROM sdin_normas_relaciones a
                    LEFT OUTER JOIN sdin_relaciones_tipos b ON a.idRelacion = b.idRelacion
                    LEFT OUTER JOIN sdin_normas_front d ON a.idNormaDestino=d.idNormaFront
                    LEFT OUTER JOIN sdin_normas_tipos c ON d.idNormaTipo=c.idNormaTipo
                    WHERE (a.idNormaOrigen=?) AND a.estado=1`;

        connection.pool.query(sql, [request.idNormaFront], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerTemasNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT DISTINCT a.idTema, b.tema, a.idNormaHijo, b.descripcion
                    FROM sdin_temas_jerarquia a 
                    LEFT OUTER JOIN sdin_temas b ON a.idTema = b.idTema
                    LEFT OUTER JOIN sdin_normas_front c ON a.idNormaHijo = c.idNormaSDIN
                    WHERE a.idNormaHijo=? AND a.estado=1 AND c.mostrarRamaTema = 1`;

        connection.pool.query(sql, [request.idNormaSDIN], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerImagenes(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*
        FROM sdin_imagenes a 
        WHERE a.idNorma=?`;

        connection.pool.query(sql, [request.idNorma], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = {
    traerNormas, traerUnaNorma, traerJerarquiaTemas, traerDependencias, traerOrganismos,
    normaTiposSDIN, traerAlcances, traerClases, traerRelacionesDeNorma, traerTemasNormaSDIN,
    /* traerEstados,  */traerGestiones, traerImagenes, traerImagenSDIN,traerRelaciones
}