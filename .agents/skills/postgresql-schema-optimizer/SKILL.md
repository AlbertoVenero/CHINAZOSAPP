---
name: postgresql-schema-optimizer
description: Diseña esquemas relacionales optimizados en PostgreSQL, índices B-Tree/GIN/GiST, scripts de migración seguros sin bloqueos de tabla y análisis de planes de ejecución EXPLAIN. Usar al diseñar o ajustar bases de datos.
---

# PostgreSQL Schema & Query Optimizer

Este skill guía el diseño relacional robusto y la optimización de rendimiento en PostgreSQL.

## Plantilla DDL de Tabla Optimizada

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices estratégicos
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_tenant_email ON users (tenant_id, LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_metadata_gin ON users USING gin (metadata);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_created ON users (created_at DESC) WHERE is_active = true;
```

## Protocolo de Optimización de Consultas Lentas
1. Ejecutar: `EXPLAIN (ANALYZE, BUFFERS, VERBOSE) <query>;`
2. Identificar:
   - **Seq Scan en tablas grandes:** Requiere crear o ajustar índices.
   - **High Shared Hit / Read Blocks:** Revisar tamaño de memoria o condiciones de filtro.
   - **External Merge Disk en ordenamientos:** Aumentar `work_mem` para la sesión o usar índices preordenados (`DESC/ASC`).
