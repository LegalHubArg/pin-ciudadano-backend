
const jwt = require('jsonwebtoken') 

const tokenSign = async (usuario) => { 
  return jwt.sign(
      {
          _usuario: usuario.usuario, //CUIT
          _apellido: usuario.descripcion,
          //role: user.role //Permisos
      }, //TODO: Payload ! Carga útil
      process.env.SECRET_STRING, //TODO ENV 
      {
          expiresIn: "2h", //TODO tiempo de vida
      }
  );
}



const { traerNormasBAC } = require('../models/bo');
  async function loginApi(req, res, next) {
    try {


      const usuario = req.usuario;


      // token
      const tokenSession = await tokenSign(usuario)

      res.status(200)
      res.send({
        status: 'ok',
        mensaje: 'PIN: Bienvenido!',
        nombre: usuario.descripcion,
        tokenSession
      })
      res.end();
      return;

  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error en el login.", data: String(er) }))
      res.end();
      return;
  
    }
  }

  function fechaAString(fecha)
  {
    const fechaHora =fecha; 
    const year = fechaHora.getFullYear();
    const month = fechaHora.getMonth() + 1; 
    const day = fechaHora.getDate();
    const fechaString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return fechaString;

  }

  async function traerProcesoDeCompra(req, res, next) {
    try {
      
    const idNormaSubtipo = parseInt(req.body.idNormaSubtipo);
    const idNormaTipo = parseInt(req.body.idNormaTipo);
    const numeroBAC = req.body.numeroBAC;
    const tiposPermitidos = process.env.API_BAC_NORMAS_TIPOS
    const subtiposPermitidos = process.env.API_BAC_NORMAS_SUBTIPOS

    let request = {};
    request.idNormaSubtipo = idNormaSubtipo;
    request.idNormaTipo = idNormaTipo;
    request.numeroBAC = numeroBAC;


    if (tiposPermitidos.includes(idNormaTipo) && subtiposPermitidos.includes(idNormaSubtipo)) {
      console.log("OK Validación Tipo Subtipo")
    }
    else
    {
      console.log("TIPO O SUBTIPO NO PERMITIDO")
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Proceso de compra. Tipo o Subtipo no permitido", data: request }))
      res.end();
      return;
    }


  
      let respuesta = await traerNormasBAC(request)
      let apiRespuesta = {}
      let publicaciones = []

      if (respuesta && respuesta.length > 0) {
        //console.log('CON AL MENOS UNA PUBLICACION');
        

        respuesta.forEach(item => {

          publicaciones.push({ numero_boletin: item.numeroBoletin, fecha: fechaAString(item.fechaP)})
          
        });
      

        apiRespuesta.id = respuesta[0].id
        apiRespuesta.nro_bac = respuesta[0].nro_bac
        apiRespuesta.fecha_ingreso = respuesta[0].fecha_ingreso
        apiRespuesta.usuario = respuesta[0].usuario
        apiRespuesta.id_tipo_norma = respuesta[0].idNormaTipo
        apiRespuesta.tipo_norma = respuesta[0].tipo_norma
        apiRespuesta.id_subtipo_norma = respuesta[0].idNormaSubtipo
        apiRespuesta.sub_tipo_norma = respuesta[0].sub_tipo_norma
        apiRespuesta.cantidad_dias = publicaciones.length
        apiRespuesta.numero_boletin = publicaciones
        apiRespuesta.idNormaTipo = request.idNormaTipo
        apiRespuesta.idNormaSubtipo = request.idNormaSubtipo

      } else {
        //console.log('SIN PUBLICACION');
      }
  
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Proceso de compra.', data: apiRespuesta }))
    
      res.end();
      return;
  
    }
    catch (er) {
      console.log(er)
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Proceso de compra.", data: String(er) }))
      res.end();
      return;
  
    }
  }

module.exports = {
    loginApi,
    traerProcesoDeCompra
}