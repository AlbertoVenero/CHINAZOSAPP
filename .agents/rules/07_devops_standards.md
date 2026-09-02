# Estándares DevOps, Docker, Kubernetes y CI/CD

## 1. Contenedores Docker
- Emplear **Multi-stage builds** para separar el entorno de compilación del entorno de ejecución final.
- Usar imágenes base minimalistas y seguras (`gcr.io/distroless/static`, `alpine` o `node:alpine`).
- No ejecutar contenedores como root:
  ```dockerfile
  USER 10001:10001
  ```
- Optimizar el orden de las instrucciones para aprovechar la caché de capas de Docker (copiar lockfiles antes del código fuente).

## 2. Kubernetes
- Todo Deployment debe incluir:
  - `resources.requests` (cpu, memory) y `resources.limits`.
  - `livenessProbe` para reinicio de contenedores bloqueados.
  - `readinessProbe` para asegurar que el pod reciba tráfico solo cuando esté listo.
  - `securityContext` con `readOnlyRootFilesystem: true` y `allowPrivilegeEscalation: false`.

## 3. Pipelines de CI/CD
- Ejecutar en paralelo: Linters -> Tests Unitarios -> Tests de Integración -> Build de imagen -> Escaneo de Vulnerabilidades (Trivy).
- Los secretos deben gestionarse a través de variables de entorno seguras / Secret Managers, nunca en el repositorio.
