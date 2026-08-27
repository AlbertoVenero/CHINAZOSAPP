// src/services/UploadService.js
import apiService from './ApiService';

class UploadService {
    constructor() {
        this.URI = apiService.getUploadUrl();
        console.log('📤 UploadService: URL de upload:', this.URI);
    }

    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            console.log('📤 UploadService: Subiendo archivo:', file.name);
            
            const response = await fetch(this.URI, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Error al subir imagen: ${error}`);
            }
            
            const result = await response.json();
            console.log('✅ UploadService: Imagen subida correctamente:', result);
            return result;
        } catch (error) {
            console.error('❌ UploadService: Error al subir imagen:', error);
            throw error;
        }
    }

    async uploadMultipleImages(files) {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });
            
            console.log('📤 UploadService: Subiendo múltiples archivos:', files.length);
            
            const response = await fetch(this.URI, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Error al subir imágenes: ${error}`);
            }
            
            const result = await response.json();
            console.log('✅ UploadService: Imágenes subidas correctamente:', result);
            return result;
        } catch (error) {
            console.error('❌ UploadService: Error al subir imágenes:', error);
            throw error;
        }
    }
}

export default UploadService;