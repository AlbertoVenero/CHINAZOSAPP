// src/services/ApiService.js
class ApiService {
    constructor() {
        const rawBaseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
        this.BASE_URL = rawBaseUrl.replace(/\/+$/, '');
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