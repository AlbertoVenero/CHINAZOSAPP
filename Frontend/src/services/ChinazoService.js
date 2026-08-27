// src/services/ChinazoService.js
import apiService from './ApiService';

class ChinazoService {
    constructor() {
        this.URI = `${apiService.URI}/chinazo/chinazos`;
    }

    // ============================================================
    // CHINAZOS
    // ============================================================

    // Obtener todos los chinazos
    async getChinazos() {
        try {
            console.log('📤 [ChinazoService] getChinazos');
            const response = await fetch(this.URI);
            if (!response.ok) throw new Error('Error al obtener chinazos');
            const data = await response.json();
            return data.map(item => ({
                ...item,
                total_votos: parseInt(item.total_votos) || 0
            }));
        } catch (error) {
            console.error('❌ Error en getChinazos:', error);
            throw error;
        }
    }

    // Obtener chinazos con filtros
    async getChinazosFiltrados(filtros) {
        try {
            console.log('📤 [ChinazoService] getChinazosFiltrados:', filtros);
            
            const params = new URLSearchParams();
            
            if (filtros.tipo) {
                params.append('tipo', filtros.tipo);
            }
            if (filtros.mes) {
                params.append('mes', filtros.mes);
            }
            if (filtros.año) {
                params.append('año', filtros.año);
            }
            if (filtros.fechaInicio) {
                params.append('fechaInicio', filtros.fechaInicio);
            }
            if (filtros.fechaFin) {
                params.append('fechaFin', filtros.fechaFin);
            }
            if (filtros.sicarioId) {
                params.append('sicarioId', filtros.sicarioId);
            }
            
            const url = `${this.URI}/filtros?${params.toString()}`;
            console.log('📤 [ChinazoService] URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener chinazos filtrados');
            
            const data = await response.json();
            console.log(`✅ [ChinazoService] Datos recibidos: ${data.length}`);
            
            return data.map(item => ({
                ...item,
                total_votos: parseInt(item.total_votos) || 0
            }));
        } catch (error) {
            console.error('❌ Error en getChinazosFiltrados:', error);
            throw error;
        }
    }

    // Crear un nuevo chinazo
    async postChinazo(chinazo) {
        try {
            console.log('📤 [ChinazoService] postChinazo:', chinazo);
            const response = await fetch(this.URI, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(chinazo),
                credentials: 'include'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al crear chinazo');
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Error en postChinazo:', error);
            throw error;
        }
    }

    // Obtener un chinazo por ID
    async getChinazoById(id) {
        try {
            console.log(`📤 [ChinazoService] getChinazoById: ${id}`);
            const response = await fetch(`${this.URI}/${id}`);
            if (!response.ok) throw new Error('Error al obtener chinazo');
            const data = await response.json();
            return {
                ...data,
                total_votos: parseInt(data.total_votos) || 0
            };
        } catch (error) {
            console.error('❌ Error en getChinazoById:', error);
            throw error;
        }
    }

    // Actualizar un chinazo
    async putChinazo(id, chinazo) {
        try {
            console.log(`📤 [ChinazoService] putChinazo: ${id}`);
            const response = await fetch(`${this.URI}/${id}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PUT',
                body: JSON.stringify(chinazo),
                credentials: 'include'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al actualizar chinazo');
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Error en putChinazo:', error);
            throw error;
        }
    }

    // Eliminar un chinazo
    async deleteChinazo(id) {
        try {
            console.log(`📤 [ChinazoService] deleteChinazo: ${id}`);
            const response = await fetch(`${this.URI}/${id}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || 'Error al eliminar chinazo');
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Error en deleteChinazo:', error);
            throw error;
        }
    }

    // Obtener meses disponibles con chinazos
    async getMesesDisponibles() {
        try {
            console.log('📤 [ChinazoService] getMesesDisponibles');
            const chinazos = await this.getChinazos();
            const meses = new Set();
            
            chinazos.forEach(chinazo => {
                if (chinazo.fecha) {
                    // ✅ Convertir de YYYY/MM/DD a YYYY-MM
                    const mes = chinazo.fecha.substring(0, 7).replace('/', '-');
                    meses.add(mes);
                }
            });
            
            const mesesArray = Array.from(meses).sort().reverse();
            console.log(`✅ [ChinazoService] Meses disponibles: ${mesesArray.length}`);
            return mesesArray;
        } catch (error) {
            console.error('❌ Error en getMesesDisponibles:', error);
            throw error;
        }
    }

    // Obtener chinazos de un mes específico
    async getChinazosByMes(mes) {
        try {
            console.log(`📤 [ChinazoService] getChinazosByMes: ${mes}`);
            const [year, month] = mes.split('-');
            const filtros = {
                tipo: 'mes',
                mes: month,
                año: year
            };
            return await this.getChinazosFiltrados(filtros);
        } catch (error) {
            console.error('❌ Error en getChinazosByMes:', error);
            throw error;
        }
    }
}

export default ChinazoService;