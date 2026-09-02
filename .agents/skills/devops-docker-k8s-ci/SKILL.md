---
name: devops-docker-k8s-ci
description: Genera Dockerfiles multi-stage optimizados y no-root, manifests de Kubernetes con probes y límites de recursos, y pipelines de GitHub Actions / GitLab CI. Usar para tareas de infraestructura y despliegue.
---

# DevOps Docker, Kubernetes & CI/CD Generator

Este skill proporciona plantillas seguras y optimizadas para contenedores y orquestación.

## Plantilla Dockerfile Multi-Stage (Node/Go/NestJS)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Plantilla Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sigeap-api
  labels:
    app: sigeap-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sigeap-api
  template:
    metadata:
      labels:
        app: sigeap-api
    spec:
      containers:
      - name: api
        image: sigeap-api:latest
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```
