// src/services/ApiService.js
class ApiService {
    constructor() {
        let rawBaseUrl = import.meta.env?.VITE_BACKEND_URL 
                      || import.meta.env?.VITE_API_URL 
                      || import.meta.env?.VITE_BACKEND_PRIVATE 
                      || 'http://localhost:5000';
        
        rawBaseUrl = (rawBaseUrl || '').toString().trim().replace(/\/+$/, '');

        // Si es un dominio público sin http/https (ej: mi-backend.up.railway.app)
        if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
            // Si es localhost o IP privada usar http, si es dominio en la nube usar https
            if (rawBaseUrl.startsWith('localhost') || rawBaseUrl.startsWith('127.0.0.1')) {
                rawBaseUrl = `http://${rawBaseUrl}`;
            } else {
                rawBaseUrl = `https://${rawBaseUrl}`;
            }
        }

        this.BASE_URL = rawBaseUrl;
        this.URI = `${this.BASE_URL}/api`;
        this.UPLOADS_URL = `${this.BASE_URL}/uploads`;
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