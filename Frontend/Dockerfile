# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Argumentos de compilación para variables de entorno de Vite
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ARG VITE_BACKEND_PRIVATE

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_BACKEND_PRIVATE=$VITE_BACKEND_PRIVATE

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias limpias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar proyecto
RUN npm run build

# Etapa 2: Servidor de producción ligero con Nginx
FROM nginx:alpine

# Fijar worker_processes a 1 y eliminar autotuning para evitar 72 workers ociosos
RUN sed -i 's/worker_processes.*/worker_processes 1;/' /etc/nginx/nginx.conf && \
    rm -f /docker-entrypoint.d/30-tune-worker-processes.sh

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx con soporte para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80 para Railway
EXPOSE 80

# Healthcheck para verificar que Nginx responde en todas las interfaces
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/healthz || exit 1

# Asegurar que Nginx se ejecute en primer plano
CMD ["nginx", "-g", "daemon off;"]
