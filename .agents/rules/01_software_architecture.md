# Reglas de Arquitectura de Software y Código Limpio

## 1. Clean Architecture y Arquitectura Hexagonal (Ports & Adapters)
- **Capa de Dominio (`/domain`):**
  - Contiene Entidades de Negocio, Value Objects, Enums e Interfaces de Repositorio (Puertos de Salida).
  - **REGLA ESTRICTA:** Cero dependencias de frameworks externos (sin anotaciones de ORMs, librerías HTTP o UI).
- **Capa de Aplicación (`/application`):**
  - Contiene Casos de Uso (Use Cases / Interactors), DTOs (Data Transfer Objects) e interfaces de servicios.
  - Orquesta el flujo de negocio y aplica validaciones lógicas.
- **Capa de Infraestructura (`/infrastructure`):**
  - Implementa los repositorios (PostgreSQL, Redis, APIs externas) y configuraciones de clientes.
- **Capa de Presentación / Entrada (`/presentation` o `/delivery`):**
  - Controladores REST, resolvers GraphQL, comandos CLI o Widgets/Páginas UI.

## 2. Principios de Diseño
- **Inversión de Dependencias (DIP):** Las capas de alto nivel no deben depender de las de bajo nivel; ambas deben depender de abstracciones.
- **Inmutabilidad de Value Objects:** Los objetos de valor representan atributos sin identidad conceptual (ej. `Email`, `Money`, `DNI`) y deben ser inmutables.
- **Manejo de Errores Tipados:** Usar tipos Result/Either o excepciones de dominio específicas en lugar de excepciones genéricas.
