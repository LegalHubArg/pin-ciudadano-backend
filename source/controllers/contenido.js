const { traerContenido } = require('../models/contenido')

async function traerContenidoController(req, res, next) {
    let request = {
      seccion: req.body.seccion
    };
  
    try {
  
      const contenido = await traerContenido(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer el contenido.", data: e })
        });
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: `PIN: contenido traído con éxito`, data: contenido }))
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

  /* async function traerContenidoController(req, res, next) {

    try {
  
      let respuesta = await traerContenido()
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
  } */

  module.exports = { traerContenidoController }