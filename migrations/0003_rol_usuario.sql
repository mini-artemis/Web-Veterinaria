-- Nuevo rol para usuarios; temporalmente al iniciar sesión solo muestra la bienvenida.

INSERT INTO roles (id, nombre, descripcion)
VALUES (4, 'Usuario', 'Solo ve la bienvenida al iniciar sesión')
ON CONFLICT (nombre) DO NOTHING;

SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT max(id) FROM roles));
