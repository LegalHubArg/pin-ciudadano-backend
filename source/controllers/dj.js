const { traerNormas, traerRamas, traerTemas, traerUnaNorma, arbolTematico } = require('../models/dj')

async function traerNormasDJ(req, res, next) {

    let request = {};
    request.idNormaTipo = req.body?.idNormaTipo;
    request.normaAnio = req.body?.normaAnio;
    request.normaNumero = req.body?.normaNumero;
    request.idRama = req.body?.idRama;
    request.idTema = req.body?.idTema;
    request.texto = req.body?.texto;
    request.fechaPublicacionDesde = req.body?.fechaPublicacionDesde;
    request.fechaPublicacionHasta = req.body?.fechaPublicacionHasta;
    request.vigente = req.body?.vigente;
    request.boletinNumero = req.body?.boletinNumero;

    //Paginacion
    request.limite = req.body.limite;
    request.offset = (req.body.paginaActual - 1) * req.body.limite;

    try {

        let normas = await traerNormas(request)
            .catch((e) => {
                throw e
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: 'PIN: Normas:', data: normas }))
        res.end();
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer normas.", data: String(e) }))
        res.end();
    }
}

async function traerRamasController(req, res, next) {

    try {

        let ramas = await traerRamas()
            .catch((e) => {
                throw e
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: 'PIN: Ramas:', data: ramas }))
        res.end();
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer ramas.", data: String(e) }))
        res.end();
    }
}

async function traerTemasController(req, res, next) {

    try {

        let temas = await traerTemas()
            .catch((e) => {
                throw e
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: 'PIN: Temas:', data: temas }))
        res.end();
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer temas.", data: String(e) }))
        res.end();
    }
}

async function traerUnaNormaDJ(req, res, next) {

    let request = { idNorma: req.body?.idNorma }
    try {

        let result = await traerUnaNorma(request)
            .catch((e) => {
                throw e
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: 'PIN: Norma:', data: result }))
        res.end();
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer la norma.", data: String(e) }))
        res.end();
    }
}

async function traerArbolTematico(req, res, next) {

    try {

        let result = await arbolTematico()
            .catch((e) => {
                throw e
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: 'Arbol Temático', data: result }))
        res.end();
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(e) }))
        res.end();
    }
}

module.exports = {
    traerNormasDJ,
    traerRamasController,
    traerTemasController,
    traerUnaNormaDJ,
    traerArbolTematico
}