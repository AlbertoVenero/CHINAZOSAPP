# Estándares de NestJS y Backend TypeScript

## 1. Módulos y Arquitectura
- Agrupar por capacidades de negocio (`UsersModule`, `DocumentsModule`, `AuthModule`).
- Inyectar dependencias utilizando interfaces o tokens simbólicos para mantener bajo acoplamiento.
- Separar lógica de negocio en servicios puros de aplicación; los controladores solo gestionan deserialización, validación y códigos de estado HTTP.

## 2. Validación de Entrada y Seguridad
- DTOs definidos con clases y decoradores de `class-validator` (`@IsString()`, `@IsUUID()`, `@IsOptional()`, etc.).
- Configurar en `main.ts` el pipe global:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  ```
- Proteger endpoints con `Guards` (`JwtAuthGuard`, `RolesGuard`) y decoradores de metadatos personalizados (`@Roles('ADMIN')`).

## 3. Manejo de Excepciones y Logs
- Usar filtros globales de excepción (`AllExceptionsFilter`) que devuelvan respuestas en formato estandarizado RFC 7807 (Problem Details).
- Registrar logs en formato JSON estructurado incluyendo `traceId`, `timestamp`, `method`, `path` y `durationMs`.
