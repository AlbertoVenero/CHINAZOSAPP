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

# Puerto por defecto si Railway no inyecta la variable $PORT
ENV PORT=80

# Desactivar autotuning que genera decenas de workers en servidores multinúcleo
ENV NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=0

# Asegurar que envsubst solo reemplace la variable PORT y no variables nativas de Nginx
ENV NGINX_ENVSUBST_FILTER="PORT"

# Instalar libcap para permitir enlazar a puertos <1024 siendo usuario no-root
RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx

# Copiar configuración principal de Nginx (1 worker process, rutas /tmp)
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar plantilla del virtual host SPA (será procesada por el entrypoint de Nginx)
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

# Copiar archivos compilados desde la etapa build
COPY --from=build /app/dist /usr/share/nginx/html

# Ajustar permisos para ejecución como usuario no-root (nginx UID 101)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /etc/nginx/templates && \
    touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid

# Usuario no privilegiado conforme a estándares DevOps (07_devops_standards.md)
USER nginx

# Exponer puerto para documentación
EXPOSE 80

# Comprobación de salud interna
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:${PORT}/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
