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

# Etapa 2: Servidor de producción ligero y seguro con Nginx
FROM nginx:alpine

# Puerto por defecto (80) si Railway no inyecta la variable $PORT
ENV PORT=80

# Eliminar el script de autotuning de workers para evitar que Nginx lance 72 workers
RUN rm -f /docker-entrypoint.d/30-tune-worker-processes.sh

# Asegurar que envsubst solo reemplace la variable PORT y preserve variables internas de Nginx
ENV NGINX_ENVSUBST_FILTER="PORT"

# Copiar configuración principal de Nginx (fijando 1 solo worker process)
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar plantilla del virtual host SPA (será procesada por el entrypoint de Nginx con $PORT)
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

# Copiar archivos compilados desde la etapa build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto para Railway
EXPOSE 80

# Comprobación de salud interna
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:${PORT}/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
