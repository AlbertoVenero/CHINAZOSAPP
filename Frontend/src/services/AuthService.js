// src/services/AuthService.js
import apiService from './ApiService';

class AuthService {
    constructor() {
        this.URI = `${apiService.URI}/chinazo/sicarios`;
        this.sicario = null;
    }

    async login(alias, password) {
        try {
            console.log('📝 [AuthService] Intentando login...');
            const response = await fetch(`${this.URI}/login`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ alias, password }),
                credentials: 'include'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al iniciar sesión');
            }
            const data = await response.json();
            console.log('✅ [AuthService] Login exitoso:', data);
            this.sicario = data.sicario;
            localStorage.setItem('sicario', JSON.stringify(data.sicario));
            return data;
        } catch (error) {
            console.error('❌ [AuthService] Error en login:', error);
            throw error;
        }
    }

    async logout() {
        try {
            console.log('📤 [AuthService] Cerrando sesión...');
            await fetch(`${this.URI}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            console.log('✅ [AuthService] Sesión cerrada en el servidor');
        } catch (error) {
            console.error('❌ [AuthService] Error en logout:', error);
        } finally {
            this.sicario = null;
            localStorage.removeItem('sicario');
            console.log('✅ [AuthService] Estado local limpiado');
        }
    }

    async verificarSesion() {
        try {
            console.log('🔍 [AuthService] Verificando sesión...');
            const response = await fetch(`${this.URI}/verificar`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('📊 [AuthService] Verificación:', data);
            if (data.autenticado) {
                this.sicario = data.sicario;
                localStorage.setItem('sicario', JSON.stringify(data.sicario));
                console.log('✅ [AuthService] Usuario autenticado:', this.sicario.alias);
            } else {
                this.sicario = null;
                localStorage.removeItem('sicario');
                console.log('❌ [AuthService] No autenticado');
            }
            return data;
        } catch (error) {
            console.error('❌ [AuthService] Error al verificar sesión:', error);
            this.sicario = null;
            localStorage.removeItem('sicario');
            return { autenticado: false, sicario: null };
        }
    }

    async changePassword(sicarioId, newPassword) {
        try {
            console.log('🔑 [AuthService] ============================');
            console.log(`🔑 [AuthService] Cambiando password para ID: ${sicarioId}`);
            console.log(`🔑 [AuthService] URL: ${this.URI}/password/${sicarioId}`);
            console.log(`🔑 [AuthService] Nueva password: ${newPassword}`);
            
            const response = await fetch(`${this.URI}/password/${sicarioId}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PUT',
                body: JSON.stringify({ password: newPassword }),
                credentials: 'include'
            });
            
            console.log(`🔑 [AuthService] Status de respuesta: ${response.status}`);
            
            if (!response.ok) {
                const error = await response.json();
                console.log('❌ [AuthService] Error del servidor:', error);
                throw new Error(error.mensaje || 'Error al cambiar contraseña');
            }
            
            const data = await response.json();
            console.log('✅ [AuthService] Respuesta del servidor:', data);
            
            // ✅ Actualizar el sicario en memoria si se devuelve
            if (data.sicario) {
                console.log(`✅ [AuthService] Actualizando sicario en memoria:`, data.sicario);
                this.sicario = data.sicario;
                localStorage.setItem('sicario', JSON.stringify(data.sicario));
                console.log('✅ [AuthService] Sicario actualizado en localStorage');
            } else {
                console.log('⚠️ [AuthService] No se devolvió sicario en la respuesta');
                // Si no se devuelve, obtenemos los datos actualizados
                const sicarioActual = this.getSicario();
                if (sicarioActual) {
                    console.log('ℹ️ [AuthService] Manteniendo sicario actual:', sicarioActual);
                }
            }
            
            console.log('✅ [AuthService] Contraseña actualizada exitosamente');
            console.log('🔑 [AuthService] ============================');
            return data;
        } catch (error) {
            console.error('❌ [AuthService] Error en changePassword:', error);
            console.error('❌ [AuthService] Stack:', error.stack);
            throw error;
        }
    }

    getSicario() {
        if (!this.sicario) {
            const stored = localStorage.getItem('sicario');
            if (stored) {
                try {
                    this.sicario = JSON.parse(stored);
                    console.log('📦 [AuthService] Sicario cargado desde localStorage:', this.sicario.alias);
                } catch (e) {
                    console.error('❌ [AuthService] Error al parsear sicario:', e);
                    this.sicario = null;
                }
            }
        }
        return this.sicario;
    }

    isAuthenticated() {
        const autenticado = !!this.getSicario();
        console.log(`🔍 [AuthService] isAuthenticated: ${autenticado}`);
        return autenticado;
    }
}

const authService = new AuthService();
export default authService;