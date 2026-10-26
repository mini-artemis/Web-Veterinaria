-- Esquema inicial del sistema de la veterinaria Puppy and Kitty.
-- Diagrama y explicación de cada tabla en docs/DISENO-BD.md

PRAGMA foreign_keys = ON;

-- ============================================================
-- ROLES Y PERMISOS
-- Cada usuario tiene un rol; cada rol tiene varios permisos.
-- ============================================================

CREATE TABLE roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE permisos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  clave       TEXT    NOT NULL UNIQUE,  -- la que revisa el código, ej. 'inventario.editar'
  descripcion TEXT    NOT NULL
);

-- Tabla intermedia (relación muchos a muchos entre roles y permisos)
CREATE TABLE rol_permisos (
  rol_id     INTEGER NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
  permiso_id INTEGER NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- ============================================================
-- USUARIOS Y SESIONES (login)
-- ============================================================

CREATE TABLE usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT    NOT NULL,
  correo        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,              -- nunca se guarda la contraseña en texto plano
  rol_id        INTEGER NOT NULL REFERENCES roles(id),
  activo        INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  ultimo_acceso TEXT,
  creado_en     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Sesiones abiertas. El navegador guarda un token en una cookie y aquí solo
-- se guarda su hash: si alguien roba la base de datos no puede usar las sesiones.
CREATE TABLE sesiones (
  id         TEXT    PRIMARY KEY,               -- hash SHA-256 del token
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_en  TEXT    NOT NULL,
  creado_en  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);

-- ============================================================
-- INVENTARIO
-- ============================================================

CREATE TABLE categorias (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT    NOT NULL UNIQUE
);

CREATE TABLE proveedores (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre   TEXT    NOT NULL UNIQUE,
  telefono TEXT,
  correo   TEXT
);

CREATE TABLE productos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo          TEXT    NOT NULL UNIQUE,       -- SKU o código de barras
  nombre          TEXT    NOT NULL,
  descripcion     TEXT,
  categoria_id    INTEGER NOT NULL REFERENCES categorias(id),
  proveedor_id    INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  unidad          TEXT    NOT NULL DEFAULT 'pieza', -- pieza, caja, frasco, kg, ml...
  precio_compra   REAL    NOT NULL DEFAULT 0 CHECK (precio_compra >= 0),
  precio_venta    REAL    NOT NULL DEFAULT 0 CHECK (precio_venta  >= 0),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo    INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0), -- abajo de esto se avisa
  lote            TEXT,
  fecha_caducidad TEXT,                          -- AAAA-MM-DD (medicamentos y vacunas)
  activo          INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en       TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado_en  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);

-- Historial de entradas y salidas. El stock de un producto solo cambia
-- registrando un movimiento, así siempre se sabe quién movió qué y cuándo.
CREATE TABLE movimientos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
  tipo        TEXT    NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  motivo      TEXT,                              -- compra, venta, consulta, caducado...
  fecha       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_movimientos_producto ON movimientos(producto_id, fecha);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO roles (id, nombre, descripcion) VALUES
  (1, 'Administrador', 'Acceso total: inventario y usuarios'),
  (2, 'Veterinario',   'Consulta el inventario y registra entradas y salidas'),
  (3, 'Recepción',     'Solo consulta el inventario');

INSERT INTO permisos (id, clave, descripcion) VALUES
  (1, 'inventario.ver',        'Ver productos y existencias'),
  (2, 'inventario.movimiento', 'Registrar entradas y salidas de stock'),
  (3, 'inventario.editar',     'Crear, editar y dar de baja productos'),
  (4, 'usuarios.administrar',  'Crear usuarios y asignar roles');

INSERT INTO rol_permisos (rol_id, permiso_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4),
  (2, 1), (2, 2),
  (3, 1);

INSERT INTO categorias (nombre) VALUES
  ('Medicamentos'), ('Vacunas'), ('Alimento'),
  ('Material de curación'), ('Higiene y estética'), ('Accesorios');

INSERT INTO proveedores (nombre, telefono, correo) VALUES
  ('Distribuidora Veterinaria del Centro', '55 1111 2222', 'ventas@dvc.example'),
  ('Alimentos Mascota Feliz',              '55 3333 4444', 'pedidos@mascotafeliz.example');

INSERT INTO productos (codigo, nombre, categoria_id, proveedor_id, unidad, precio_compra, precio_venta, stock, stock_minimo, lote, fecha_caducidad) VALUES
  ('MED-001', 'Amoxicilina 250 mg suspensión', 1, 1, 'frasco', 85,  140, 12, 5,  'L2408', '2027-03-31'),
  ('MED-002', 'Meloxicam 1.5 mg/ml',           1, 1, 'frasco', 120, 210, 3,  4,  'L1190', '2026-12-15'),
  ('VAC-001', 'Vacuna séxtuple canina',        2, 1, 'dosis',  160, 350, 20, 10, 'V7781', '2027-01-20'),
  ('VAC-002', 'Vacuna triple felina',          2, 1, 'dosis',  150, 330, 8,  6,  'V5520', '2026-11-30'),
  ('ALI-001', 'Croquetas cachorro 2 kg',       3, 2, 'bolsa',  210, 320, 15, 5,  NULL,    '2027-06-01'),
  ('CUR-001', 'Gasas estériles 10x10',         4, 1, 'caja',   45,  80,  30, 10, NULL,    NULL),
  ('HIG-001', 'Shampoo dermatológico 250 ml',  5, 2, 'frasco', 95,  170, 6,  3,  NULL,    '2028-01-01');
