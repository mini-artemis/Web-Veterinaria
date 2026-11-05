-- Registro de aceptación del aviso de privacidad al iniciar sesión por primera vez.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aviso_privacidad_aceptado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aviso_privacidad_fecha TIMESTAMPTZ;
