---
name: clean-architecture-scaffolder
description: Genera y valida la estructura de carpetas y clases base siguiendo Clean Architecture y Hexagonal para cualquier lenguaje (TypeScript, Go, Dart, etc.). Usar al crear nuevos módulos, servicios o reestructurar código.
---

# Clean Architecture Scaffolder

Este skill guía al agente en la creación estricta de módulos basados en Clean Architecture y Puertos & Adaptadores.

## Estructura de Directorios Estándar

```text
src/modules/<feature_name>/
├── domain/                      # Capa 1: Lógica Pura
│   ├── entities/                # Entidades con identidad única
│   ├── value_objects/           # Objetos de valor inmutables
│   ├── events/                  # Eventos de dominio
│   └── repositories/            # Puertos de salida (interfaces)
├── application/                 # Capa 2: Casos de Uso
│   ├── use_cases/               # Clases con método execute()
│   ├── dtos/                    # Contratos de entrada y salida
│   └── services/                # Interfaces de servicios de aplicación
└── infrastructure/              # Capa 3: Adaptadores y Frameworks
    ├── persistence/             # Implementaciones de Repositorios (Postgres/ORM)
    ├── http/                    # Controladores y rutas REST/GraphQL
    └── mappers/                 # Conversión entre Entidades de Dominio y Modelos de BD
```

## Reglas de Validación
1. **Sin dependencias externas en `domain/`:** No importar librerías de infraestructura, frameworks ni ORMs.
2. **Inyección por Interfaces:** Los casos de uso en `application/` solo deben depender de las interfaces declaradas en `domain/repositories/`.
3. **Mappers Obligatorios:** Los datos de la base de datos deben ser mapeados a entidades de dominio ricas antes de ser procesados por los casos de uso.
