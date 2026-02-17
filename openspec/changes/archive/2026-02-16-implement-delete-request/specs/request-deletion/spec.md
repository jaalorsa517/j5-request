# Especificación: Funcionalidad de Eliminar Petición

## Requisitos AÑADIDOS

### Requisito: Eliminar Archivo de Petición
Los usuarios deben poder eliminar un archivo `.j5request`, y dicha eliminación debe activar un diálogo de confirmación.

#### Escenario: Usuario elimina un archivo de petición
- **CUANDO** el usuario hace clic derecho en un archivo de petición en el árbol lateral
- **ENTONCES** debe aparecer un menú contextual con una opción "Eliminar"
- **CUANDO** el usuario selecciona "Eliminar"
- **ENTONCES** debe aparecer un diálogo de confirmación mostrando el nombre del archivo a eliminar
- **CUANDO** el usuario confirma la acción
- **ENTONCES** el archivo debe ser eliminado del sistema de archivos
- **ENTONCES** si el archivo estaba abierto en una pestaña, esa pestaña debe cerrarse
- **ENTONCES** si el archivo estaba seleccionado, la selección debe limpiarse

### Requisito: Eliminar Carpeta
Los usuarios deben poder eliminar una carpeta, y dicha eliminación debe activar un diálogo de confirmación advirtiendo que todo el contenido se perderá.

#### Escenario: Usuario elimina una carpeta
- **CUANDO** el usuario hace clic derecho en una carpeta en el árbol lateral
- **ENTONCES** debe aparecer un menú contextual con una opción "Eliminar"
- **CUANDO** el usuario selecciona "Eliminar"
- **ENTONCES** debe aparecer un diálogo de confirmación mostrando el nombre de la carpeta y advirtiendo de la eliminación recursiva
- **CUANDO** el usuario confirma la acción
- **ENTONCES** la carpeta y todo su contenido deben ser eliminados del sistema de archivos
- **ENTONCES** si algún archivo dentro de la carpeta estaba abierto en una pestaña, esas pestañas deben cerrarse
- **ENTONCES** si algún archivo dentro de la carpeta estaba seleccionado, la selección debe limpiarse

### Requisito: Cancelar Eliminación
Los usuarios deben poder cancelar el proceso de eliminación sin cambios.

#### Escenario: Usuario cancela la eliminación
- **CUANDO** el diálogo de confirmación está abierto
- **ENTONCES** el usuario puede hacer clic en "Cancelar" o hacer clic fuera del diálogo para descartarlo
- **ENTONCES** no se deben realizar cambios en el sistema de archivos
