-- Permite cancelar citas liberando el horario para que pueda volver a agendarse.

ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'cancelada'));

ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_fecha_hora_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_citas_fecha_hora_activa ON citas (fecha, hora) WHERE estado = 'programada';
