# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Argumentos de compilación para variables de entorno de Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar proyecto
RUN npm run build

# Etapa 2: Servidor de producción ligero con Nginx
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx con soporte para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
