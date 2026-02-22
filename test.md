Abre J5-Request y realiza las siguientes pruebas conectando a https://localhost:4433/test-ssl:

Escenario A: Verificación de SSL Desactivada
Arranca el servidor (node server.js).
En J5-Request, intenta hacer el GET sin configurar nada de SSL. Debería fallar (porque el certificado es auto-firmado por tu CA).
Activa "Disable SSL Verification" en la pestaña SSL.
Resultado esperado: La petición tiene éxito y la UI muestra una advertencia visual de seguridad.

Escenario B: Uso de CA personalizada
Arranca el servidor (node server.js).
En J5-Request, asegúrate de que "Disable SSL Verification" esté desactivado.
En la sección "CA Certificates", selecciona el archivo certs/ca.crt que generaste.
Resultado esperado: La petición tiene éxito (ahora J5-Request confía en tu CA).

Escenario C: Mutual TLS (mTLS)
Arranca el servidor en modo mTLS (MTLS=true node server.js).
En J5-Request, intenta la petición solo con la CA configurada.
Resultado esperado: Error 400 o falla de conexión (el servidor rechaza la petición porque falta el certificado de cliente).
Configura en J5-Request:
CA: certs/ca.crt
Client Certificate: certs/client.crt
Client Key: certs/client.key
Resultado esperado: Éxito. El JSON de respuesta debería decir "auth": "Certificado de cliente validado".

Escenario D: Configuración a nivel de Proyecto
Copia un set de certificados a una carpeta .j5certs/ en la raíz de tu proyecto abierto en J5-Request.
Verifica que al seleccionarlos en la UI, se guarden como rutas relativas en el archivo .j5request.
Crea un archivo .j5project.json en la raíz con la configuración CA global y verifica que los requests que no tienen configuración SSL propia hereden esta configuración.