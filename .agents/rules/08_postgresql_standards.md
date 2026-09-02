# Estándares de Diseño y Optimización en PostgreSQL

## 1. Diseño de Tablas y Tipos de Datos
- **Claves Primarias:** Usar `UUIDv7` o `BIGINT GENERATED ALWAYS AS IDENTITY`.
- **Fechas:** Usar siempre `TIMESTAMPTZ` (UTC) en lugar de `TIMESTAMP` sin zona horaria.
- **Campos Dinámicos:** Usar `JSONB` solo cuando el esquema sea realmente variable. Crear índices GIN sobre campos consultados frecuentemente:
  ```sql
  CREATE INDEX idx_audit_metadata ON audit_logs USING gin (metadata);
  ```
- **Claves Foráneas:** Crear SIEMPRE un índice B-tree en la columna de la clave foránea para evitar bloqueos de tabla (*Table Scans*) durante operaciones `DELETE` o `UPDATE` en cascada.

## 2. Índices y Rendimiento de Consultas
- Analizar consultas lentas con `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)`.
- Crear índices parciales para estados filtrados frecuentemente:
  ```sql
  CREATE INDEX idx_pending_orders ON orders (created_at) WHERE status = 'PENDING';
  ```
- En producción, crear índices con `CREATE INDEX CONCURRENTLY` para no bloquear operaciones de lectura y escritura.

## 3. Conexiones y Transacciones
- Mantener las transacciones lo más cortas posible para reducir contención de locks.
- Emplear pooling de conexiones (ej. PgBouncer o pool de aplicación) limitando el número de conexiones simultáneas por instancia.
