const { traerNormas, traerUnaNorma, traerJerarquiaTemas, normaTiposSDIN, traerOrganismos, traerDependencias,
        traerAlcances, traerClases, traerRelacionesDeNorma, traerTemasNormaSDIN, traerEstados, traerGestiones, traerImagenes, traerImagenSDIN
         } = require('../models/sdin')
let AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT
});

async function traerNormasSDIN(req, res, next) {

    let request = {};
    request.estado = req.body?.estado;
    request.idNorma = req.body?.idNorma;
    request.idNormaTipo = req.body?.idNormaTipo;
    request.normaAnio = req.body?.normaAnio;
    request.normaNumero = req.body?.normaNumero;
    request.idOrganismo = req.body?.idOrganismo;
    //request.idDependencia = req.body?.idDependencia;
    request.dependencias = req.body?.dependencias;
    request.idClase = req.body?.idClase;
    request.idGestion = req.body?.idGestion;
    request.idNormasEstadoTipo = req.body?.idNormasEstadoTipo;
    request.fechaSancionDesde = req.body?.fechaSancionDesde;
    request.fechaSancionHasta = req.body?.fechaSancionHasta;
    request.fechaPublicacionDesde = req.body?.fechaPublicacionDesde;
    request.fechaPublicacionHasta = req.body?.fechaPublicacionHasta;
    request.alcance = req.body?.alcance;
    request.texto = req.body?.texto;
    request.textoSum = req.body?.textoSum;
    request.textoCont = req.body?.textoCont;
    request.textoSumario = req.body?.textoSumario;
    request.textoContenido = req.body?.textoContenido;
    request.sinSumario = req.body?.sinSumario;
    request.sinContenido = req.body?.sinContenido;
    request.temas = req.body?.temas;
    request.textoConsolidado = req.body?.textoConsolidado;
    request.textoActualizado = req.body?.textoActualizado;
    request.tematica = req.body?.tematica;
    request.rama = req.body?.rama;
    request.textoBO = req.body?.textoBO;

    //Paginacion
    request.limite = req.body.limite;
    request.offset = (req.body.paginaActual - 1) * req.body.limite;

    try {
        let normas = await traerNormas(request)
            .catch((e) => {
                throw e
            });
        res.status(200)
        res.send(JSON.stringify({ mensaje: 'PIN: Boletín mostrado con éxito:', data: normas }))
        res.end();
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar el boletín.", data: String(e) }))
        res.end();
    }
}

async function traerArchivoS3SdinNormas(req, res) {
  let archivoS3 = req.body.archivoS3
  try {
    let params = {
        Key: process.env.S3_SDIN_NORMAS + archivoS3,
        Bucket: process.env.AWS_BUCKET_NAME
      };

      function encode(data) {
        let buf = Buffer.from(data);
        let base64 = buf.toString('base64');
        return base64
      }
      let object = await s3.getObject(params).promise()
      let archivoBase64 = encode(object.Body)
      if (!object) { throw Error("No se encontró documento para mostrar")}
      
      res.status(200).send({mensaje: "PIN: Archivo traído con exito.", data: archivoBase64})
    } catch (error) {
    res.status(409).send(error)
  }
}

async function traerArchivoS3Digesto(req, res) {
 let archivoS3 = req.body.archivoS3
  try {
    
    function encode(data) {
      let buf = Buffer.from(data);
      let base64 = buf.toString('base64');
      return base64
    }

      let params = {
        Key: process.env.S3_DIGESTO + archivoS3,
        Bucket: process.env.AWS_BUCKET_NAME
      }

      let object = await s3.getObject(params).promise();
      let archivoBase64 = encode(object.Body)

      res.status(200).send({mensaje: "PIN: Antecedentes traídos con exito.", data: archivoBase64})
    } catch (error) {
    res.status(409).send(error)
  }
}

async function traerUnaNormaSDIN(req, res, next) {
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

async function traerImagenSDINController(req, res, next) {

  let request = { idNorma: req.body?.idNorma, numero:req.body?.numero }
  try {

      let result = await traerImagenSDIN(request)
          .catch((e) => {
              throw e
          });

      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Imagen:', data: result }))
      res.end();
  }
  catch (e) {
      console.log(e)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer la imagen.", data: String(e) }))
      res.end();
  }
}

async function traerArchivoTextoActualizado(req, res, next) {

  try {
    let params = {
      Key: process.env.S3_SDIN_NORMAS + req.body.archivo,
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

async function traerJerarquiaTemasSDIN(req, res, next) {
    try {
  
      const jerarquia = await traerJerarquiaTemas()
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer las jerarquias.", data: e })
        });
        
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: `PIN: Jerarquía`, data: jerarquia }))
      res.end();
      return;
    }
    catch (e) {
      console.log(e)
      res.status(409);
      res.send(JSON.stringify({ e }))
      res.end();
      return;
    }
  }

  async function normasTiposSDINController(req, res, next) {
    try {
      let respuesta = await normaTiposSDIN()
        .catch((err) => {
          throw err
        });
      res.status(200).send(JSON.stringify({ mensaje: 'PIN: Tipos de Norma SDIN.', data: respuesta })).end();
      return;
    }
    catch (err) {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
      res.end();
    }
  }

  
async function traerOrganismosSDINController(req, res, next) {
    try {
      let request = {};
  
      let respuesta = await traerOrganismos(request)
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Organismos SDIN.', data: respuesta }))
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Organismos.", data: String(er) }))
      res.end();
      return;
  
    }
  }
  
  async function traerDependenciasSDINController(req, res, next) {
    try {
      let request = {};
  
      let respuesta = await traerDependencias(request)
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Dependencias SDIN.', data: respuesta }))
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Dependencias SDIN.", data: String(er) }))
      res.end();
      return;
  
    }
  }
  
  async function traerAlcancesSDINController(req, res, next) {
    try {
      let request = {};
  
      let respuesta = await traerAlcances(request)
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Alcances SDIN.', data: respuesta }))
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Alcances SDIN.", data: String(er) }))
      res.end();
      return;
  
    }
  }
  
  async function traerClasesSDINController(req, res, next) {
    try {
      let request = {};
  
      let respuesta = await traerClases(request)
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Clases SDIN.', data: respuesta }))
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Clases SDIN.", data: String(er) }))
      res.end();
      return;
  
    }
  }

  async function traerImagenesNormaSDINController(req, res, next) {
    let request = {
      idNorma: req.body.idNorma
    };
  
    try {
  
      const imagenes = await traerImagenes(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer las imagenes.", data: e })
        });
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: `PIN: Imagenes traidas con éxito`, data: imagenes }))
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
  
  /* async function traerEstadosSDINController(req, res, next) {
    try {
      let request = {};
  
      let respuesta = await traerEstados(request)
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Estados SDIN.', data: respuesta }))
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Estados SDIN.", data: String(er) }))
      res.end();
      return;
  
    }
  }
   */
  async function traerGestionesSDINController(req, res, next) {
    try {
      let request = {};
  
      let respuesta = await traerGestiones(request)
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Gestiones SDIN.', data: respuesta }))
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Gestiones SDIN.", data: String(er) }))
      res.end();
      return;
  
    }
  }

  async function traerRelacionesDeNormaSDINController(req, res, next) {
    let request = {
      idNormaFront: req.body.idNorma
    };
  
    try {
  
      const relaciones = await traerRelacionesDeNorma(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer relaciones.", data: e })
        });
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: `PIN: Relaciones`, data: relaciones }))
      res.end();
      return;
    }
    catch (e) {
      res.status(409); console.log(e)
      res.send(JSON.stringify({ e }))
      res.end();
      return;
    }
  }

  async function traerTemasNormaSDINController(req, res, next) {
    let request = {
      idNormaSDIN: req.body.idNorma
    };
  
    try {
  
      const temas = await traerTemasNormaSDIN(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer los temas.", data: e })
        });
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: `PIN: temas traidos con éxito`, data: temas }))
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
    traerNormasSDIN,
    traerUnaNormaSDIN,
    traerJerarquiaTemasSDIN,
    normasTiposSDINController, traerDependenciasSDINController, traerOrganismosSDINController,
    traerAlcancesSDINController, traerClasesSDINController, traerRelacionesDeNormaSDINController, traerArchivoS3SdinNormas,
    traerTemasNormaSDINController, traerArchivoS3Digesto, /* traerEstadosSDINController, */ traerGestionesSDINController, traerImagenesNormaSDINController, traerImagenSDINController, traerArchivoTextoActualizado }