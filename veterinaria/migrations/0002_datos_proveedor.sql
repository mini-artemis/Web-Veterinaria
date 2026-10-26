-- Datos completos del proveedor (10 campos en total junto con nombre, telefono y correo).
-- Diagrama actualizado en docs/DISENO-BD.md

ALTER TABLE proveedores ADD COLUMN razon_social  TEXT;
ALTER TABLE proveedores ADD COLUMN rfc           TEXT;  -- 12 o 13 caracteres
ALTER TABLE proveedores ADD COLUMN contacto      TEXT;  -- persona con quien se hacen los pedidos
ALTER TABLE proveedores ADD COLUMN direccion     TEXT;  -- calle, número y colonia
ALTER TABLE proveedores ADD COLUMN ciudad        TEXT;
ALTER TABLE proveedores ADD COLUMN estado        TEXT;
ALTER TABLE proveedores ADD COLUMN codigo_postal TEXT;

UPDATE proveedores SET
  razon_social  = 'Distribuidora Veterinaria del Centro S.A. de C.V.',
  rfc           = 'DVC150312AB4',
  contacto      = 'Laura Méndez',
  direccion     = 'Av. Insurgentes Sur 1450, Col. Actipan',
  ciudad        = 'Ciudad de México',
  estado        = 'Ciudad de México',
  codigo_postal = '03230'
WHERE nombre = 'Distribuidora Veterinaria del Centro';

UPDATE proveedores SET
  razon_social  = 'Alimentos Mascota Feliz S. de R.L. de C.V.',
  rfc           = 'AMF180905QX2',
  contacto      = 'Jorge Ramírez',
  direccion     = 'Calle Industria 220, Parque Industrial Toluca 2000',
  ciudad        = 'Toluca',
  estado        = 'Estado de México',
  codigo_postal = '50200'
WHERE nombre = 'Alimentos Mascota Feliz';
