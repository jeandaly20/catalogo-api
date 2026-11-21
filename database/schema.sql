-- =====================================================================
-- Catálogo de productos con favoritos y acceso por roles
-- Script de creación de tablas y datos de ejemplo (PostgreSQL)
-- Se puede ejecutar con:  npm run db:init   o   psql -d catalogo_db -f database/schema.sql
-- ADVERTENCIA: elimina y vuelve a crear las tablas (reinicia los datos).
-- =====================================================================

DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

-- Usuarios: el correo es único y solo se guarda el hash de la contraseña.
CREATE TABLE usuarios (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    correo         VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    rol            VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                   CHECK (rol IN ('usuario', 'admin')),
    creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Productos: el precio debe ser mayor que cero.
CREATE TABLE productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120)  NOT NULL,
    descripcion     TEXT          NOT NULL,
    categoria       VARCHAR(60)   NOT NULL,
    precio          NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    creado_en       TIMESTAMP     NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Favoritos: relación usuario-producto.
-- La clave primaria compuesta impide duplicados.
-- ON DELETE CASCADE: al eliminar un producto (o usuario) se eliminan sus
-- favoritos, así no quedan referencias a registros inexistentes.
CREATE TABLE favoritos (
    usuario_id   INTEGER   NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    producto_id  INTEGER   NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    agregado_en  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, producto_id)
);

CREATE INDEX idx_productos_categoria ON productos (LOWER(categoria));

-- Datos de ejemplo (ficticios)
INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES
('Laptop Andina 14',        'Laptop de 14 pulgadas, 16 GB de RAM y 512 GB SSD',   'Tecnologia', 749.99),
('Audífonos Inalámbricos',  'Audífonos Bluetooth con cancelación de ruido',       'Tecnologia',  59.90),
('Cafetera Express',        'Cafetera de 15 bares con vaporizador de leche',      'Hogar',      129.50),
('Lámpara de Escritorio',   'Lámpara LED con tres niveles de intensidad',         'Hogar',       24.75),
('Mochila Urbana',          'Mochila impermeable con compartimento para laptop',  'Accesorios',  39.00),
('Libro de Algoritmos',     'Introducción a estructuras de datos y algoritmos',   'Libros',      32.40);
