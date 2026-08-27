// src/services/VotoService.js
import apiService from './ApiService';

class VotoService {
    constructor() {
        this.URI = `${apiService.URI}/votos`;
    }

    // Obtener conteo de votos de todos los chinazos
    async getConteoVotos() {
        try {
            console.log('📊 [VotoService] Obteniendo conteo de votos');
            const response = await fetch(`${this.URI}/conteo`, {
                credentials: 'include' // ✅ Agregar
            });
            if (!response.ok) throw new Error('Error al obtener conteo de votos');
            const data = await response.json();
            return data.map(item => ({
                ...item,
                total_votos: parseInt(item.total_votos) || 0
            }));
        } catch (error) {
            console.error('❌ Error en getConteoVotos:', error);
            throw error;
        }
    }

    // Obtener votos de un chinazo específico
    async getVotosByChinazo(chinazo_id) {
        try {
            console.log(`📋 [VotoService] Obteniendo votos para chinazo ${chinazo_id}`);
            const response = await fetch(`${this.URI}/chinazo/${chinazo_id}`, {
                credentials: 'include' // ✅ Agregar
            });
            if (!response.ok) throw new Error('Error al obtener votos del chinazo');
            return await response.json();
        } catch (error) {
            console.error('❌ Error en getVotosByChinazo:', error);
            throw error;
        }
    }

    // 🔍 Verificar si ya votó (NUEVO)
    async verificarVoto(chinazo_id) {
        try {
            console.log(`🔍 [VotoService] Verificando voto para chinazo ${chinazo_id}`);
            const response = await fetch(`${this.URI}/verificar/${chinazo_id}`, {
                credentials: 'include' // ✅ IMPORTANTE
            });
            if (!response.ok) throw new Error('Error al verificar voto');
            const data = await response.json();
            console.log(`🔍 [VotoService] Verificación: ${data.yaVoto ? '✅ Ya votó' : '❌ No ha votado'}`);
            return data;
        } catch (error) {
            console.error('❌ Error en verificarVoto:', error);
            throw error;
        }
    }

    // Registrar un voto (anónimo con control de dispositivo)
    async postVoto(chinazo_id) {
        try {
            console.log(`📤 [VotoService] Registrando voto para chinazo ${chinazo_id}`);
            
            // ✅ Agregar credentials: 'include' para enviar cookies
            const response = await fetch(this.URI, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ chinazo_id }),
                credentials: 'include' // ✅ CRÍTICO: Envía las cookies al backend
            });
            
            console.log(`📤 [VotoService] Status: ${response.status}`);
            
            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Error del servidor:', error);
                throw new Error(error.mensaje || 'Error al registrar voto');
            }
            
            const data = await response.json();
            console.log('✅ Voto registrado:', data);
            
            // ✅ Guardar device_id en localStorage (opcional)
            if (data.device_id) {
                localStorage.setItem('device_id', data.device_id);
                console.log('💾 Device ID guardado en localStorage');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error en postVoto:', error);
            throw error;
        }
    }
}

export default VotoService;