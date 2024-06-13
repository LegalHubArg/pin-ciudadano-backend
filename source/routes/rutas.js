const express = require('express')
const router = express.Router()
const { traerContenidoController } = require('../controllers/contenido')
const { traerBoletinesPublicadosController, traerSeccionesBoletinesController,
    traerTiposNormasController, traerReparticionesController, traerArchivo,
    traerSubtiposNormasController, traerOrganismosController, traerBoletinesController,
    traerSeparatasController } = require('../controllers/bo');
const { traerNormasSDIN, traerUnaNormaSDIN, traerJerarquiaTemasSDIN, normasTiposSDINController, 
    traerDependenciasSDINController, traerOrganismosSDINController, traerAlcancesSDINController,
    traerClasesSDINController, traerRelacionesDeNormaSDINController, traerTemasNormaSDINController, traerArchivoS3SdinNormas,
    /* traerEstadosSDINController,  */traerGestionesSDINController, traerImagenesNormaSDINController, traerImagenSDINController, traerArchivoTextoActualizado, traerArchivoS3Digesto,traerRelacionesSDINController } = require('../controllers/sdin')
const { traerNormasDJ, traerRamasController, traerTemasController, traerUnaNormaDJ, traerArbolTematico } = require('../controllers/dj')
const { loginApi, traerProcesoDeCompra } = require('../controllers/api-bac')

//Contenido Headers
router.post('/contenido', traerContenidoController);

//Boletín Oficial
router.post('/bo/mostrar/boletines', traerBoletinesPublicadosController);
router.get('/bo/mostrar/secciones', traerSeccionesBoletinesController);
router.get('/bo/mostrar/tipos-normas', traerTiposNormasController);
router.get('/bo/mostrar/subtipos-normas', traerSubtiposNormasController);
router.get('/bo/mostrar/reparticiones', traerReparticionesController);
router.get('/bo/mostrar/organismos', traerOrganismosController);
router.post('/traer-archivo', traerArchivo);
router.post('/bo/mostrar/boletines/normas', traerBoletinesController);
router.post('/bo/separatas', traerSeparatasController);

//SDIN
router.post('/sdin/normas', traerNormasSDIN)
router.post('/sdin/norma', traerUnaNormaSDIN)
router.post('/sdin/traer-archivo-sdin', traerArchivoS3SdinNormas)
router.post('/sdin/norma/imagen', traerImagenSDINController)
router.post('/sdin/norma/archivo-texto-actualizado', traerArchivoTextoActualizado)
router.post('/sdin/norma/relaciones', traerRelacionesDeNormaSDINController)
router.post('/sdin/norma/temas', traerTemasNormaSDINController)
router.post('/sdin/norma/imagenes', traerImagenesNormaSDINController)
router.get('/sdin/traer/jerarquia', traerJerarquiaTemasSDIN)

router.get('/sdin/tipos-normas', normasTiposSDINController)
router.get('/sdin/organismos',traerOrganismosSDINController)
router.get('/sdin/dependencias', traerDependenciasSDINController)
router.get('/sdin/relaciones', traerRelacionesSDINController) 
router.get('/sdin/alcances', traerAlcancesSDINController) 
router.get('/sdin/clases', traerClasesSDINController) 
// router.get('/sdin/estados', traerEstadosSDINController) 
router.get('/sdin/gestion', traerGestionesSDINController) 


//Digesto
router.post('/dj/normas', traerNormasDJ)
router.post('/dj/traer-archivo-digesto', traerArchivoS3Digesto)
router.get('/dj/ramas', traerRamasController)
router.get('/dj/temas', traerTemasController)
router.post('/dj/norma', traerUnaNormaDJ)
router.get('/dj/arbol-tematico', traerArbolTematico)

//Auth API

const jwt = require('jsonwebtoken') 

const verifyToken = async (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_STRING)
    } catch (e) {
        return null
    }
  }


const checkAuth = async (req, res, next) => {
    try {
        if(req.headers.authorization === undefined)
        { 
            console.log('ERROR: Token no proporcionado.')
            res.status(409)
            res.send({ status: "bloqueado", mensaje: 'PIN: Token no proporcionado.' })
            return;
        }
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        // console.log('ESTO VIENE DEL TOKEN')
        // console.log(tokenData)
        if (tokenData._usuario) {
            next()
        } else {
            console.log('ERROR: Usuario no autenticado o token vencido.')
            res.status(409)
            res.send({ status: "bloqueado", mensaje: 'PIN: Usuario no autenticado o token vencido.' })
        }
  
    } catch (e) {
        console.log('ERROR: Usuario no autenticado o token vencido.')
        res.status(409)
        res.send({ status: "bloqueado", mensaje: 'PIN: Usuario no autenticado o token vencido.' })
    }
  
  }

  const connection = require("../services/conexion-mariadb");

  function getUsuarioBOAPI(usuario, password) {
    return new Promise((resolve, reject) => {

        let sql = `SELECT *
        FROM bo_usuarios_api
        WHERE usuario=? AND password = ? AND estado = 1`;
        let params = [usuario, password];

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
    })
}


  async function checkUsuarioPINAPI(req, res, next) {
    //Para que valide el usuario en PIN debe existir como usuario SDIN o como usuario BO
    try {
        let usuario = req.body.usuario;
        let password = req.body.password;

        let resultsBO = await getUsuarioBOAPI(usuario, password)

        if (resultsBO.length === 0) {
            console.log('Bloqueado - Token Erroneo o credenciales inválidas: ')
            throw { status: 'bloqueado', mensaje: 'PIN: El Usuario no pertenece a la plataforma PIN.', error: 'Petición no permitida.' }
        }
        else {
            req.usuario = resultsBO[0];
            next()
        }
    }
    catch (err) {
        console.log('error en checkUsuarioPINAPI: ', err)
        res.status(409)
        res.send(JSON.stringify(err))
        res.end()

    }
}

router.post('/auth/login-api', checkUsuarioPINAPI, loginApi)
router.post('/bo/consulta-proceso-compra', checkAuth, traerProcesoDeCompra)

module.exports = router;