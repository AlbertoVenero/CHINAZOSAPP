// src/services/SicarioService.js
import apiService from './ApiService';

class SicarioService {
    constructor() {
        this.URI = `${apiService.URI}/chinazo/sicarios`;
    }

    // ============================================================
    // CRUD DE SICARIOS
    // ============================================================

    async getSicarios() {
        try {
            const response = await fetch(this.URI);
            if (!response.ok) throw new Error('Error al obtener sicarios');
            return await response.json();
        } catch (error) {
            console.error('Error en getSicarios:', error);
            throw error;
        }
    }

    async getSicarioById(id) {
        try {
            const response = await fetch(`${this.URI}/${id}`);
            if (!response.ok) throw new Error('Error al obtener sicario');
            return await response.json();
        } catch (error) {
            console.error('Error en getSicarioById:', error);
            throw error;
        }
    }

    async postSicario(sicario) {
        try {
            const response = await fetch(this.URI, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(sicario),
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al crear sicario');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en postSicario:', error);
            throw error;
        }
    }

    async putSicario(id, sicario) {
        try {
            const response = await fetch(`${this.URI}/${id}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PUT',
                body: JSON.stringify(sicario),
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al actualizar sicario');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en putSicario:', error);
            throw error;
        }
    }

    async deleteSicario(id) {
        try {
            const response = await fetch(`${this.URI}/${id}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'DELETE',
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al eliminar sicario');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en deleteSicario:', error);
            throw error;
        }
    }

    async searchSicarios(termino) {
        try {
            const response = await fetch(`${this.URI}/buscar?q=${encodeURIComponent(termino)}`);
            if (!response.ok) throw new Error('Error al buscar sicarios');
            return await response.json();
        } catch (error) {
            console.error('Error en searchSicarios:', error);
            throw error;
        }
    }

    // ============================================================
    // AUTENTICACIÓN
    // ============================================================

    async login(alias, password) {
        try {
            const response = await fetch(`${this.URI}/login`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ alias, password }),
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al iniciar sesión');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async verificarSesion() {
        try {
            const response = await fetch(`${this.URI}/verificar`, {
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) throw new Error('Error al verificar sesión');
            return await response.json();
        } catch (error) {
            console.error('Error en verificarSesion:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.URI}/logout`, {
                method: 'POST',
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) throw new Error('Error al cerrar sesión');
            return await response.json();
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    }

    async cambiarPassword(id, password) {
        try {
            const response = await fetch(`${this.URI}/password`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PUT',
                body: JSON.stringify({ id, password }),
                credentials: 'include'  // ✅ Agregado
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al cambiar contraseña');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en cambiarPassword:', error);
            throw error;
        }
    }
}

export default SicarioService;