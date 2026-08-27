// src/pages/ganadores/useGanadoresPage.tsx
import { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import GanadorService from '../../services/GanadorService.js';
// @ts-ignore
import apiService from '../../services/ApiService.js';

const ganadorService = new GanadorService();

export interface Ganador {
    id: number;
    chinazo_id: number;
    mes: string;
    total_votos: number;
    total_votantes: number;
    porcentaje: number;
    fecha_registro: string;
    texto_chinazo?: string;
    fecha_chinazo?: string;
    sicario_id?: number;
    sicario_nombre?: string;
    sicario_alias?: string;
    sicario_foto?: string | null;
    ganador?: {
        id: number;
        nombre: string;
        alias: string;
        chinazo: string;
        foto: string | null;
        totalVotos: number;
        totalVotantes: number;
        porcentaje: number;
    };
}

export interface MesDisponible {
    key: string;
    label: string;
}

export const useGanadoresPage = () => {
    // Estados
    const [ganadores, setGanadores] = useState<Ganador[]>([]);
    const [ganadoresFiltrados, setGanadoresFiltrados] = useState<Ganador[]>([]);
    const [mesSeleccionado, setMesSeleccionado] = useState<string>('todos');
    const [loading, setLoading] = useState(false);
    const [calculando, setCalculando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

    // ✅ Función para obtener URL de imagen (igual que en Historial)
    const getImageUrl = useCallback((filename: string | null) => {
        return apiService.getImageUrl(filename);
    }, []);

    // Obtener mes actual y anterior
    const obtenerMeses = useCallback(() => {
        const fechaActual = new Date();
        const year = fechaActual.getFullYear();
        const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const mesActual = `${year}-${month}`;
        
        let mesAnteriorYear = year;
        let mesAnteriorMonth = fechaActual.getMonth();
        if (mesAnteriorMonth === 0) {
            mesAnteriorMonth = 12;
            mesAnteriorYear = year - 1;
        }
        const mesAnterior = `${mesAnteriorYear}-${String(mesAnteriorMonth).padStart(2, '0')}`;
        
        return { mesActual, mesAnterior };
    }, []);

    const { mesActual, mesAnterior } = obtenerMeses();

    // Obtener meses disponibles de los ganadores
    const getMesesDisponibles = useCallback((): MesDisponible[] => {
        const meses = ganadores.map((g: Ganador) => g.mes);
        const mesesUnicos = [...new Set(meses)].sort().reverse();
        
        return [
            { key: 'todos', label: 'Todos los meses' },
            ...mesesUnicos.map((mes: string) => ({
                key: mes,
                label: formatearMes(mes)
            }))
        ];
    }, [ganadores]);

    // Formatear mes para mostrar
    const formatearMes = (mes: string): string => {
        if (!mes) return mes;
        const meses: { [key: string]: string } = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
            '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
            '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        const [year, month] = mes.split('-');
        return `${meses[month] || month} ${year}`;
    };

    // Transformar datos para el componente
    const transformarGanador = (ganador: any): Ganador => {
        return {
            ...ganador,
            ganador: {
                id: ganador.sicario_id || ganador.id,
                nombre: ganador.sicario_nombre || ganador.nombre || '',
                alias: ganador.sicario_alias || ganador.alias || '',
                chinazo: ganador.texto_chinazo || ganador.chinazo || '',
                foto: ganador.sicario_foto || ganador.foto || null,
                totalVotos: ganador.total_votos || 0,
                totalVotantes: ganador.total_votantes || 0,
                porcentaje: ganador.porcentaje || 0
            }
        };
    };

    // Cargar ganadores
    const cargarGanadores = useCallback(async () => {
        console.log('🔄 [Ganadores] Cargando ganadores...');
        setLoading(true);
        setError(null);
        
        try {
            const data = await ganadorService.getGanadores();
            console.log('✅ [Ganadores] Ganadores cargados:', data.length);
            
            const ganadoresTransformados = data.map((item: any) => transformarGanador(item));
            setGanadores(ganadoresTransformados);
            
            if (mesSeleccionado === 'todos') {
                setGanadoresFiltrados(ganadoresTransformados);
            } else {
                const filtrados = ganadoresTransformados.filter((g: Ganador) => g.mes === mesSeleccionado);
                setGanadoresFiltrados(filtrados);
            }
        } catch (error: any) {
            console.error('❌ [Ganadores] Error:', error);
            setError(error.message || 'Error al cargar los ganadores');
            setMensaje({ 
                texto: '❌ Error al cargar los ganadores', 
                tipo: 'error' 
            });
        } finally {
            setLoading(false);
        }
    }, [mesSeleccionado]);

    // Cargar datos iniciales
    useEffect(() => {
        cargarGanadores();
    }, []);

    // Filtrar cuando cambia el mes seleccionado
    useEffect(() => {
        if (mesSeleccionado === 'todos') {
            setGanadoresFiltrados(ganadores);
        } else {
            const filtrados = ganadores.filter((g: Ganador) => g.mes === mesSeleccionado);
            setGanadoresFiltrados(filtrados);
        }
    }, [mesSeleccionado, ganadores]);

    // ============================================================
    // FUNCIONES PRINCIPALES
    // ============================================================

    // Calcular ganador del mes
    const calcularGanador = useCallback(async () => {
        console.log(`🔄 [Ganadores] Calculando ganador para: ${mesAnterior}`);
        setCalculando(true);
        setError(null);
        setMensaje(null);
        
        try {
            const tieneGanador = await ganadorService.tieneGanador(mesAnterior);
            
            if (tieneGanador) {
                setMensaje({ 
                    texto: `⚠️ Ya existe un ganador para ${formatearMes(mesAnterior)}`, 
                    tipo: 'error' 
                });
                setCalculando(false);
                return;
            }
            
            const result = await ganadorService.calcularGanadorMes(mesAnterior);
            console.log('✅ [Ganadores] Ganador calculado:', result);
            
            setMensaje({ 
                texto: `✅ ${result.mensaje} - ${formatearMes(mesAnterior)}`, 
                tipo: 'success' 
            });
            
            await cargarGanadores();
            
        } catch (error: any) {
            console.error('❌ [Ganadores] Error al calcular ganador:', error);
            setMensaje({ 
                texto: error.message || '❌ Error al calcular el ganador del mes', 
                tipo: 'error' 
            });
        } finally {
            setCalculando(false);
        }
    }, [mesAnterior, cargarGanadores]);

    // Buscar ganadores por mes
    const buscarPorMes = useCallback((mes: string) => {
        console.log(`🔍 [Ganadores] Buscando por mes: ${mes}`);
        setMesSeleccionado(mes);
    }, []);

    // Limpiar filtros
    const limpiarFiltros = useCallback(() => {
        console.log('🧹 [Ganadores] Limpiando filtros');
        setMesSeleccionado('todos');
        setError(null);
        setMensaje(null);
    }, []);

    // Cerrar mensaje
    const cerrarMensaje = useCallback(() => {
        setMensaje(null);
    }, []);

    // ============================================================
    // RETORNAR
    // ============================================================

    return {
        // Estados
        ganadores: ganadoresFiltrados,
        ganadoresTodos: ganadores,
        mesSeleccionado,
        mesesDisponibles: getMesesDisponibles(),
        loading,
        calculando,
        error,
        mensaje,
        mesActual,
        mesAnterior,
        
        // Funciones
        cargarGanadores,
        calcularGanador,
        buscarPorMes,
        limpiarFiltros,
        cerrarMensaje,
        formatearMes,
        getMesesDisponibles,
        getImageUrl,  // ✅ Exportar getImageUrl
    };
};