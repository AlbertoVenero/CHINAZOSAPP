// src/services/ApiService.js
class ApiService {
    constructor() {
        const isBrowser = typeof window !== 'undefined';
        const currentOrigin = isBrowser ? window.location.origin : '';

        // Si se ejecuta en Railway, utilizar el mismo origen para aprovechar el proxy inverso de Nginx (elimina CORS y bloqueo de cookies)
        let rawBaseUrl = import.meta.env?.VITE_BACKEND_URL
            || import.meta.env?.VITE_API_URL
            || import.meta.env?.VITE_BACKEND_PRIVATE
            || (isBrowser && window.location.hostname.includes('railway.app') ? currentOrigin : 'https://siatea.apure.gob.ve/backend');

        rawBaseUrl = (rawBaseUrl || '').toString().trim().replace(/\/+$/, '');

        // Si es un dominio público sin http/https
        if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
            if (rawBaseUrl.startsWith('localhost') || rawBaseUrl.startsWith('127.0.0.1')) {
                rawBaseUrl = `http://${rawBaseUrl}`;
            } else {
                rawBaseUrl = `https://${rawBaseUrl}`;
            }
        }

        // Si la URL termina en /api, removerlo de la base para evitar duplicación (/api/api)
        if (rawBaseUrl.endsWith('/api')) {
            rawBaseUrl = rawBaseUrl.slice(0, -4);
        }

        this.BASE_URL = rawBaseUrl;
        this.URI = `${this.BASE_URL}/api`;
        this.UPLOADS_URL = `${this.BASE_URL}/uploads`;

        console.log('✅ BASE_URL final:', this.BASE_URL);
        console.log('✅ URI final:', this.URI);
        console.log('✅ UPLOADS final:', this.UPLOADS_URL);
    }

    getImageUrl(filename) {
        if (!filename) return undefined;
        // Si ya es una URL completa (http/https), devolverla tal cual
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename;
        }
        return `${this.UPLOADS_URL}/${filename}`;
    }

    getUploadUrl() {
        return `${this.BASE_URL}/upload`;
    }

    getEndpoint(path) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.URI}${cleanPath}`;
    }
}

// Crear y exportar una instancia única
const apiService = new ApiService();
export default apiService;