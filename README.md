# API REST: Catálogo de productos con favoritos y acceso por roles

## Integrante

| Nombre | Rol en el proyecto |
|---|---|
| Jean Carlos Suárez Acevedo | Desarrollo completo: modelo de datos, API, autenticación, pruebas y documentación |

> Actividad desarrollada de forma individual.

## Propósito

API REST construida con **Node.js** y **Express** que gestiona un catálogo de productos y la lista de favoritos de cada usuario. Usa:

- **JWT** con vencimiento para la autenticación.
- **Roles** (`usuario` y `admin`) para la autorización.
- **PostgreSQL** para guardar los datos.

Reglas de acceso:

- El catálogo se puede consultar sin iniciar sesión.
- Solo el administrador crea, actualiza y elimina productos.
- Cada usuario autenticado gestiona únicamente sus propios favoritos.

## Elección de base de datos: PostgreSQL (con `pg`)

Se eligió PostgreSQL porque el problema es relacional: un favorito vincula un usuario con un producto. Con PostgreSQL las reglas de integridad quedan en la propia base de datos:

- **`UNIQUE`** en el correo impide registrar dos usuarios con el mismo correo.
- **`CHECK (precio > 0)`** impide guardar precios inválidos, aunque alguien salte la API.
- **Clave primaria compuesta `(usuario_id, producto_id)`** impide favoritos duplicados.
- **Claves foráneas con `ON DELETE CASCADE`** impiden favoritos que apunten a productos inexistentes.

Todas las consultas son **parametrizadas** (`$1, $2…`), lo que evita la inyección SQL.

## Requisitos

- Node.js 18 o superior (probado con Node 22)
- npm
- PostgreSQL 14 o superior
- Postman (o Newman para la línea de comandos)

## Estructura del proyecto

```
catalogo-api/
├── database/schema.sql          # Tablas, restricciones y 6 productos de ejemplo
├── postman/                     # Colección y entorno de Postman
├── scripts/
│   ├── init-db.js               # Ejecuta schema.sql
│   ├── crear-admin.js           # Crea el administrador desde .env
│   └── token-vencido.js         # Genera un JWT vencido para la prueba 401
└── src/
    ├── server.js                # Punto de entrada
    ├── app.js                   # Configuración de Express y rutas
    ├── config/                  # Variables de entorno y conexión a PostgreSQL
    ├── routes/                  # Definición de rutas y permisos
    ├── controllers/             # Lógica de cada endpoint
    ├── models/                  # Acceso a datos (consultas SQL)
    ├── middlewares/             # Verificación JWT, roles y manejo de errores
    └── utils/                   # Validaciones y clase ApiError
```

Flujo de una petición: **ruta → middleware (JWT / rol) → controlador (valida) → modelo (SQL) → PostgreSQL → respuesta JSON**.

## Modelo de datos

| Tabla | Campos | Restricciones |
|---|---|---|
| `usuarios` | id, nombre, correo, password_hash, rol, creado_en | correo `UNIQUE`; rol `CHECK IN ('usuario','admin')`; por defecto `usuario` |
| `productos` | id, nombre, descripcion, categoria, precio, creado_en, actualizado_en | `CHECK (precio > 0)` |
| `favoritos` | usuario_id, producto_id, agregado_en | `PRIMARY KEY (usuario_id, producto_id)`; FK con `ON DELETE CASCADE` |

**Al eliminar un producto** se eliminan automáticamente los favoritos que lo referencian (`ON DELETE CASCADE`). Así ningún usuario conserva en su lista un producto que ya no existe. La prueba 7.5 de Postman lo verifica.

## Instalación

```bash
git clone <URL-del-repositorio>
cd catalogo-api
npm install
```

Cree la base de datos en PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE catalogo_db;"
```

## Variables de entorno

Copie `.env.example` como `.env` y complete los valores:

```bash
cp .env.example .env      # En Windows: copy .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave para firmar los tokens; use una cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Vencimiento del token (ej. `1h`, `30m`) |
| `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD` | Datos del administrador inicial |

El archivo `.env` está en `.gitignore` y **no se sube** al repositorio.

## Inicialización de datos y del administrador

```bash
npm run db:init        # Crea las tablas y carga 6 productos de ejemplo (reinicia los datos)
npm run crear-admin    # Crea el administrador con ADMIN_CORREO y ADMIN_PASSWORD
```

El rol `admin` **solo** se obtiene con `npm run crear-admin`. El registro público siempre asigna el rol `usuario` e ignora cualquier campo `rol` enviado en el cuerpo de la petición.

## Ejecución

```bash
npm start     # Modo normal (en Windows también: doble clic en iniciar-servidor.bat)
npm run dev   # Modo desarrollo (se reinicia al guardar cambios)
```

URL base: `http://localhost:3000/api`

## Rutas de la API

Formato de las respuestas:

- **Éxito:** `{ "ok": true, "data": ... }` (puede incluir `mensaje` y `total`).
- **Error:** `{ "ok": false, "mensaje": "...", "detalles": ... }`.

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Cuerpo | Respuestas |
|---|---|---|---|---|
| POST | `/api/auth/registro` | Público | `{ "nombre", "correo", "password" }` | 201 usuario creado (sin contraseña) · 400 · 409 correo duplicado · 422 |
| POST | `/api/auth/login` | Público | `{ "correo", "password" }` | 200 `{ token, usuario }` · 400 · 401 credenciales incorrectas |
| GET | `/api/productos?categoria=Hogar` | Público | — | 200 lista (el filtro es opcional y no distingue mayúsculas) |
| GET | `/api/productos/:id` | Público | — | 200 · 400 id inválido · 404 |
| POST | `/api/productos` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | 201 · 400 · 401 · 403 · 422 |
| PUT | `/api/productos/:id` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | 200 · 400 · 401 · 403 · 404 · 422 |
| DELETE | `/api/productos/:id` | Admin | — | 204 · 400 · 401 · 403 · 404 |
| GET | `/api/favoritos` | Autenticado | — | 200 lista de favoritos del usuario del token · 401 |
| POST | `/api/favoritos` | Autenticado | `{ "productoId": 1 }` | 201 · 400 · 401 · 404 producto inexistente · 409 duplicado |
| DELETE | `/api/favoritos/:productoId` | Autenticado | — | 204 · 400 · 401 · 404 no está en sus favoritos |

Ejemplo de login exitoso:

```json
{
  "ok": true,
  "mensaje": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tipo": "Bearer",
    "expiraEn": "1h",
    "usuario": { "id": 2, "nombre": "Usuario A", "correo": "usuario.a@correo.test", "rol": "usuario" }
  }
}
```

### Criterio de códigos de estado

| Código | Cuándo se usa |
|---|---|
| 200 | Consulta o actualización exitosa |
| 201 | Creación exitosa (usuario, producto, favorito) |
| 204 | Eliminación exitosa (sin cuerpo) |
| **400** | **La petición está mal formada:** faltan campos obligatorios o están vacíos, un tipo es incorrecto, el identificador no es numérico o el JSON es inválido |
| **422** | **Los campos llegan completos, pero algún valor incumple una regla:** precio menor o igual a cero, correo con formato inválido o contraseña de menos de 8 caracteres |
| 401 | No se envió token, o el token es inválido o está vencido; también para credenciales incorrectas |
| 403 | El token es válido, pero el rol no tiene permiso (un usuario intenta modificar el catálogo) |
| 404 | El producto, la ruta o el favorito no existe |
| 409 | Duplicado: correo ya registrado o favorito repetido |
| 500 | Error inesperado; se responde con un mensaje genérico, sin detalles internos |

### Seguridad aplicada

- Las contraseñas se guardan con **bcrypt**. Ni la contraseña ni su hash aparecen en ninguna respuesta.
- `jwt.verify` comprueba la **firma** y el **vencimiento** del token antes de permitir el acceso a una ruta protegida.
- En los favoritos, el id del usuario se toma **solo del token verificado**. Si el cliente envía un `usuarioId` en el cuerpo, se ignora.
- Solo se aceptan los campos esperados en cada petición; el resto se descarta.
- El login responde con el mismo mensaje si falla el correo o la contraseña, para no revelar qué correos existen.

## Pruebas con Postman

Archivos en la carpeta `postman/`:

- `Catalogo.postman_collection.json`: 48 peticiones con aserciones, organizadas en 8 carpetas.
- `Catalogo.postman_environment.json`: entorno de ejemplo, sin secretos.

### Pasos

1. Inicie el servidor con `npm start`. Antes debe haber ejecutado `npm run db:init` y `npm run crear-admin`.
2. En Postman, use **Import** y cargue los dos archivos de la carpeta `postman/`.
3. Seleccione el entorno **Catalogo - Local** y complete estas variables:
   - `admin_password`: el mismo valor de `ADMIN_PASSWORD` de su `.env`.
   - `token_vencido`: ejecute `npm run token:vencido` (o doble clic en `generar-token-vencido.bat`) y pegue el resultado.
4. Abra el **Collection Runner** y ejecute las carpetas **1 a 7** en orden.
5. **Prueba de persistencia:**
   1. Detenga el servidor con `Ctrl + C`.
   2. Vuelva a iniciarlo con `npm start`.
   3. Ejecute la carpeta **8. Persistencia**.

Los correos de los usuarios A y B se generan con la fecha y hora en cada ejecución, así que la colección se puede volver a correr sin reiniciar la base de datos.

### Ejecución por consola con Newman (opcional)

```bash
npm install -g newman
newman run postman/Catalogo.postman_collection.json -e postman/Catalogo.postman_environment.json \
  --env-var admin_password=<su_clave_admin> --env-var token_vencido=$(npm run -s token:vencido) \
  --export-environment entorno-resultado.json
```

### Casos cubiertos

| Carpeta | Casos |
|---|---|
| 1. Autenticación | Registro A y B (se ignora `rol: admin`), correo duplicado 409, campos vacíos 400, correo inválido 422, login correcto, credenciales incorrectas 401, login admin |
| 2. Catálogo público | Listar sin token, filtrar por categoría, consultar por id, inexistente 404, id inválido 400 |
| 3. CRUD admin | Crear 201, consultar, actualizar 200, precio 0 o negativo 422, campos vacíos 400, actualizar inexistente 404 |
| 4. Seguridad | Sin token 401, token vencido 401, token alterado 401, crear, actualizar o eliminar con rol usuario 403 |
| 5. Favoritos | Agregar 201, duplicado 409, producto inexistente 404, sin productoId 400, listar, quitar 204 |
| 6. Aislamiento | B no ve los favoritos de A, B no puede quitar el de A (404), `usuarioId` enviado se ignora, el favorito de A permanece |
| 7. Consistencia | Eliminar producto 204, consultar eliminado 404, el favorito asociado se elimina en cascada |
| 8. Persistencia | Tras reiniciar Node.js: login de A, favoritos de A y catálogo siguen en la base de datos |

## Herramientas y recursos de apoyo

- Documentación oficial de [Express](https://expressjs.com/), [node-postgres](https://node-postgres.com/), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) y [bcryptjs](https://github.com/dcodeIO/bcrypt.js).
- Documentación de [PostgreSQL](https://www.postgresql.org/docs/) sobre restricciones y claves foráneas.
- Se utilizó un asistente de IA (Claude) como apoyo para la estructura inicial y la redacción de la documentación. El código fue revisado, ejecutado y probado por el autor, quien puede explicar cada parte.
