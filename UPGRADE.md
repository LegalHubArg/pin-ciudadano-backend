# Ajustes V1.0.10-BETA
- Quitar la variable de entorno `S3_PUBLICOS_BOLETIN` (no se usa más)
- Agregar las siguientes variables de entorno: 
- `S3_BO_PUBLICO="migration/boletinoficial/boletines-firmados-qa/"` 
- `S3_TEXTOS_CONSOLIDADOS="migration/sdin/digesto/uploads/documentos-qa/"`
- `S3_SDIN_NORMAS="migration/sdin/normativa/fileserver-qa/"`
- `S3_DIGESTO="migration/sdin/digesto/uploads/documentos-qa/"`

IMPORTANTE: tiene que terminar con la barra (/) 
Para implementar QA, el bucket tiene que estar configurado con las credenciales de QA.


# Ajustes V1.0.9-BETA

 - Agregar las siguientes variables de entorno en el  **config-map.yaml** del entorno de OPENSHIFT:
 - 

    S3_PUBLICOS_BOLETIN=""
    
    Ejemplo en QA:
    S3_PUBLICOS_BOLETIN="https://proyecto-pin.ext.s3i.buenosaires.gob.ar/rest/migration/boletinoficial/public-qa/"

- Parámetro de búsqueda de archivos en el bucket público ( importante que la ruta contenga el dns para acceso externo además de la ruta interna y que termine en "/".) 
