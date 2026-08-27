// src/services/ApiService.js
class ApiService {
    constructor() {
        this.URI = 'http://localhost:5000/api';
        this.BASE_URL = 'http://localhost:5000';
        this.UPLOADS_URL = `${this.BASE_URL}/uploads`;
    }

    getImageUrl(filename) {
        if (!filename) return undefined;
        return `${this.UPLOADS_URL}/${filename}`;
    }

    getUploadUrl() {
        return `${this.BASE_URL}/upload`;
    }

    getEndpoint(path) {
        return `${this.URI}${path}`;
    }
}

// Crear y exportar una instancia única
const apiService = new ApiService();
export default apiService;