// src/services/GanadorService.js
import apiService from './ApiService';

class GanadorService {
    constructor() {
        this.URI = `${apiService.URI}/chinazo/ganadores`;
    }

    // ============================================================
    // GANADORES
    // ============================================================

    // Obtener todos los ganadores
    async getGanadores(mes) {
        try {
            const params = mes ? `?mes=${mes}` : '';
            const response = await fetch(`${this.URI}${params}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Error al obtener ganadores');
            return await response.json();
        } catch (error) {
            console.error('❌ Error en getGanadores:', error);
            throw error;
        }
    }

    // Obtener ganador de un mes específico
    async getGanadorByMes(mes) {
        try {
            console.log(`🔍 [GanadorService] Buscando ganador para mes: ${mes}`);
            const response = await fetch(`${this.URI}/mes/${mes}`, {
                credentials: 'include'
            });
            
            // ✅ Si es 404, significa que NO hay ganador (no es error)
            if (response.status === 404) {
                console.log(`ℹ️ [GanadorService] No hay ganador para ${mes}`);
                return null;
            }
            
            if (!response.ok) {
                throw new Error('Error al obtener ganador del mes');
            }
            
            const data = await response.json();
            console.log(`✅ [GanadorService] Ganador encontrado para ${mes}`);
            return data;
        } catch (error) {
            console.error('❌ Error en getGanadorByMes:', error);
            throw error;
        }
    }

    // Calcular y guardar ganador del mes
    async calcularGanadorMes(mes) {
        try {
            console.log(`📝 [GanadorService] Calculando ganador para: ${mes}`);
            const response = await fetch(this.URI, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ mes }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al calcular ganador');
            }
            
            const data = await response.json();
            console.log(`✅ [GanadorService] Ganador calculado:`, data);
            return data;
        } catch (error) {
            console.error('❌ Error en calcularGanadorMes:', error);
            throw error;
        }
    }

    // Actualizar ganador del mes
    async actualizarGanadorMes(mes) {
        try {
            console.log(`📝 [GanadorService] Actualizando ganador para: ${mes}`);
            const response = await fetch(`${this.URI}/mes/${mes}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PUT',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al actualizar ganador');
            }
            
            const data = await response.json();
            console.log(`✅ [GanadorService] Ganador actualizado:`, data);
            return data;
        } catch (error) {
            console.error('❌ Error en actualizarGanadorMes:', error);
            throw error;
        }
    }

    // Eliminar ganador de un mes
    async deleteGanador(mes) {
        try {
            console.log(`🗑️ [GanadorService] Eliminando ganador para: ${mes}`);
            const response = await fetch(`${this.URI}/mes/${mes}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al eliminar ganador');
            }
            
            const data = await response.json();
            console.log(`✅ [GanadorService] Ganador eliminado:`, data);
            return data;
        } catch (error) {
            console.error('❌ Error en deleteGanador:', error);
            throw error;
        }
    }

    // Obtener historial completo de ganadores
    async getHistorialGanadores() {
        try {
            return await this.getGanadores('todos');
        } catch (error) {
            console.error('❌ Error en getHistorialGanadores:', error);
            throw error;
        }
    }

    // Verificar si un mes ya tiene ganador
    async tieneGanador(mes) {
        try {
            console.log(`🔍 [GanadorService] Verificando si ${mes} tiene ganador...`);
            const ganador = await this.getGanadorByMes(mes);
            
            if (ganador === null) {
                console.log(`❌ [GanadorService] ${mes} NO tiene ganador`);
                return false;
            }
            
            console.log(`✅ [GanadorService] ${mes} SÍ tiene ganador`);
            return true;
        } catch (error) {
            console.error('❌ Error en tieneGanador:', error);
            return false;
        }
    }
}

// ✅ EXPORTAR CORRECTAMENTE
export default GanadorService;