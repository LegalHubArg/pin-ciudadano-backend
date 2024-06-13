const { request } = require('express');
const { traerBoletinesPublicados, traerSeccionesBoletines,
  traerTiposNormas, traerReparticiones, traerSubtiposNormas, traerOrganismos,
  traerBoletines, traerSeparatas } = require('../models/bo');
let AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT
});

async function traerBoletinesPublicadosController(req, res, next) {

  let request = {};
  request.fechaPublicacion = req.body?.fechaPublicacion;
  request.numeroBoletin = req.body?.numeroBoletin;

  try {

    let respuesta = await traerBoletinesPublicados(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Boletín mostrado con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar el boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerSeccionesBoletinesController(req, res, next) {

  try {

    let respuesta = await traerSeccionesBoletines()
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Secciones mostradas con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar secciones.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerTiposNormasController(req, res, next) {

  try {

    let respuesta = await traerTiposNormas()
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Tipos mostrados con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar tipos.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerSubtiposNormasController(req, res, next) {

  try {

    let respuesta = await traerSubtiposNormas()
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Subtipos mostrados con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar subtipos.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerReparticionesController(req, res, next) {

  try {

    let respuesta = await traerReparticiones()
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Reparticiones mostradas con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar reparticiones.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerOrganismosController(req, res, next) {

  try {

    let respuesta = await traerOrganismos()
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Organismos mostrados con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar organismos.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerArchivo(req, res, next) {

  try {
    let Key;
    if (req.body?.tipo === "boletin") {
      Key = process.env.S3_BO_PUBLICO + req.body.archivo
    }

    let params = {
      Key,
      Bucket: process.env.AWS_BUCKET_NAME
    };
    function encode(data) {
      let buf = Buffer.from(data);
      let base64 = buf.toString('base64');
      return base64
    }
    let object = await s3.getObject(params).promise();
    res.status(200).send(encode(object.Body));
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerBoletinesController(req, res, next) {

  let request = {};
  request.fechaPublicacionDesde = req.body?.fechaPublicacionDesde;
  request.fechaPublicacionHasta = req.body?.fechaPublicacionHasta;
  request.idReparticion = req.body?.idReparticion;
  request.idSeccion = req.body?.idSeccion;
  request.idNormaTipo = req.body?.idNormaTipo;
  request.idNormaSubtipo = req.body?.idNormaSubtipo;
  request.normaNumero = req.body?.normaNumero;
  request.normaAnio = req.body?.normaAnio;
  request.palabras = req.body?.palabras;
  request.organismoEmisor = req.body?.organismoEmisor;
  request.numeroBoletin = req.body?.numeroBoletin;

  //Paginacion
  request.limite = req.body.limite;
  request.offset = (req.body.paginaActual - 1) * req.body.limite;

  try {

    let {normas, totalBoletines} = await traerBoletines(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Boletín mostrado con éxito:', data: normas, total: totalBoletines }))
    res.end();
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar el boletín.", data: String(e) }))
    res.end();
  }
}

async function traerSeparatasController(req, res, next) {
  let request = {
    idBoletin: req.body.idBoletin
  };

  try {

    const contenido = await traerSeparatas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las separatas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: separatas traídas con éxito`, data: contenido }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

module.exports = {
  traerBoletinesPublicadosController, traerSeccionesBoletinesController,
  traerTiposNormasController, traerReparticionesController, traerArchivo,
  traerSubtiposNormasController, traerOrganismosController, traerBoletinesController,
  traerSeparatasController
}