-- El login pasa a Better Auth (https://www.better-auth.com).
-- Better Auth usa cuatro tablas: usuarios (ya existía), sesiones, cuentas y verificaciones.
-- Las columnas se llaman en español; src/lib/auth.ts le dice a Better Auth cuál es cuál.

-- ============================================================
-- USUARIOS: campos que Better Auth necesita
-- ============================================================

ALTER TABLE usuarios ADD COLUMN correo_verificado INTEGER NOT NULL DEFAULT 0 CHECK (correo_verificado IN (0, 1));
ALTER TABLE usuarios ADD COLUMN imagen TEXT;
ALTER TABLE usuarios ADD COLUMN actualizado_en TEXT;
UPDATE usuarios SET actualizado_en = creado_en;

-- ============================================================
-- CUENTAS: formas de iniciar sesión de cada usuario.
-- Aquí solo se usa correo y contraseña (proveedor 'credential'), así que la
-- contraseña sale de usuarios y se guarda aquí. Los hashes no cambian:
-- todos siguen entrando con su misma contraseña.
-- ============================================================

CREATE TABLE cuentas (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  cuenta_id             TEXT    NOT NULL,          -- con correo y contraseña es el id del usuario
  proveedor             TEXT    NOT NULL,          -- 'credential' = correo y contraseña
  usuario_id            INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  password_hash         TEXT,                      -- nunca se guarda la contraseña en texto plano
  token_acceso          TEXT,                      -- los token_* y alcance solo los usaría un login con Google, etc.
  token_refresco        TEXT,
  token_id              TEXT,
  token_acceso_expira   TEXT,
  token_refresco_expira TEXT,
  alcance               TEXT,
  creado_en             TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado_en        TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, proveedor)
);

INSERT INTO cuentas (cuenta_id, proveedor, usuario_id, password_hash, creado_en, actualizado_en)
  SELECT id, 'credential', id, password_hash, creado_en, creado_en FROM usuarios;

ALTER TABLE usuarios DROP COLUMN password_hash;

-- ============================================================
-- SESIONES: se rehace con el formato de Better Auth.
-- Las sesiones abiertas se pierden: hay que volver a iniciar sesión.
-- ============================================================

DROP TABLE sesiones;

CREATE TABLE sesiones (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  token          TEXT    NOT NULL UNIQUE,          -- la cookie lo lleva firmado con BETTER_AUTH_SECRET
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_en      TEXT    NOT NULL,
  ip             TEXT,
  navegador      TEXT,
  creado_en      TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);

-- ============================================================
-- VERIFICACIONES: códigos temporales (p. ej. recuperar contraseña por correo).
-- Better Auth la requiere aunque por ahora no se use.
-- ============================================================

CREATE TABLE verificaciones (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  identificador  TEXT    NOT NULL,
  valor          TEXT    NOT NULL,
  expira_en      TEXT    NOT NULL,
  creado_en      TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_verificaciones_identificador ON verificaciones(identificador);
