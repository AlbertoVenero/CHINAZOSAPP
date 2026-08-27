// src/pages/historial/useHistorialPage.tsx
import { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import ChinazoService from '../../services/ChinazoService.js';
// @ts-ignore
import SicarioService from '../../services/SicarioService.js';
// @ts-ignore
import apiService from '../../services/ApiService.js';

const chinazoService = new ChinazoService();
const sicarioService = new SicarioService();

export interface ChinazoBackend {
    id: number;
    chinazo: string;
    fecha: string;
    fecha_registro: string;
    quien_dijo_id: number;
    quien_dijo_nombre: string;
    quien_dijo_alias: string;
    quien_dijo_foto: string | null;
    anotado_por_id: number;
    anotado_por_nombre: string;
    anotado_por_alias: string;
    anotado_por_foto: string | null;
    total_votos?: number;
}

export interface Sicario {
    id: number;
    nombre: string;
    alias: string;
    foto: string;
}

export type FiltroTipo = 'mes' | 'personalizado' | 'sicario';

// ============================================================
// AÑOS DISPONIBLES - Configuración fija (2026 - 2029)
// ============================================================
const AÑOS_DISPONIBLES = [
    { key: '2026', label: '2026' },
    { key: '2027', label: '2027' },
    { key: '2028', label: '2028' },
    { key: '2029', label: '2029' }
];

export const useHistorialPage = () => {
    // Estados de filtros
    const [tipoFiltro, setTipoFiltro] = useState<FiltroTipo>('mes');
    const [mesSeleccionado, setMesSeleccionado] = useState<string>('');
    const [añoSeleccionado, setAñoSeleccionado] = useState<string>('');
    const [fechaInicio, setFechaInicio] = useState<string>('');
    const [fechaFin, setFechaFin] = useState<string>('');
    const [filtroSicario, setFiltroSicario] = useState<string>('');
    
    // Estados de resultados
    const [resultados, setResultados] = useState<ChinazoBackend[]>([]);
    const [haBuscado, setHaBuscado] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estados de sicarios para el filtro
    const [sicarios, setSicarios] = useState<Sicario[]>([]);
    const [loadingSicarios, setLoadingSicarios] = useState<boolean>(false);

    // Función para obtener URL de imagen
    const getImageUrl = (filename: string | null) => {
        return apiService.getImageUrl(filename);
    };

    // Cargar sicarios para el filtro
    useEffect(() => {
        console.log('🔄 [Historial] Cargando sicarios...');
        cargarSicarios();
    }, []);

    const cargarSicarios = async () => {
        console.log('🔄 [Historial] cargarSicarios: Iniciando...');
        setLoadingSicarios(true);
        try {
            const data = await sicarioService.getSicarios();
            console.log('✅ [Historial] cargarSicarios: Sicarios cargados:', data.length);
            setSicarios(data);
        } catch (error) {
            console.error('❌ [Historial] cargarSicarios: Error:', error);
            setError('Error al cargar la lista de sicarios');
        } finally {
            setLoadingSicarios(false);
        }
    };

    // Funciones de búsqueda
    const buscarPorMes = useCallback(async (mes: string, año: string) => {
        console.log(`📤 [Historial] Buscando por mes: ${mes}/${año}`);
        try {
            const filtros = {
                tipo: 'mes',
                mes: mes,
                año: año
            };
            const data = await chinazoService.getChinazosFiltrados(filtros);
            console.log(`✅ [Historial] Resultados por mes: ${data.length}`);
            return data.map((item: any) => ({
                ...item,
                total_votos: parseInt(item.total_votos) || 0
            }));
        } catch (error) {
            console.error('❌ [Historial] Error al buscar por mes:', error);
            throw error;
        }
    }, []);

    const buscarPorRango = useCallback(async (inicio: string, fin: string) => {
        console.log(`📤 [Historial] Buscando por rango: ${inicio} - ${fin}`);
        try {
            const filtros = {
                tipo: 'personalizado',
                fechaInicio: inicio,
                fechaFin: fin
            };
            const data = await chinazoService.getChinazosFiltrados(filtros);
            console.log(`✅ [Historial] Resultados por rango: ${data.length}`);
            return data.map((item: any) => ({
                ...item,
                total_votos: parseInt(item.total_votos) || 0
            }));
        } catch (error) {
            console.error('❌ [Historial] Error al buscar por rango:', error);
            throw error;
        }
    }, []);

    const buscarPorSicario = useCallback(async (sicarioId: string) => {
        console.log(`📤 [Historial] Buscando por sicario: ${sicarioId}`);
        try {
            const filtros = {
                tipo: 'sicario',
                sicarioId: sicarioId
            };
            const data = await chinazoService.getChinazosFiltrados(filtros);
            console.log(`✅ [Historial] Resultados por sicario: ${data.length}`);
            return data.map((item: any) => ({
                ...item,
                total_votos: parseInt(item.total_votos) || 0
            }));
        } catch (error) {
            console.error('❌ [Historial] Error al buscar por sicario:', error);
            throw error;
        }
    }, []);

    // Función principal de búsqueda
    const handleBuscar = useCallback(async () => {
        console.log(`🔄 [Historial] handleBuscar: Iniciando búsqueda con filtro ${tipoFiltro}`);
        setLoading(true);
        setError(null);
        setHaBuscado(true);

        try {
            let data: ChinazoBackend[] = [];

            switch (tipoFiltro) {
                case 'mes':
                    if (!mesSeleccionado || !añoSeleccionado) {
                        console.warn('⚠️ [Historial] No hay mes o año seleccionado');
                        setError('Por favor selecciona un mes y año');
                        setLoading(false);
                        return;
                    }
                    data = await buscarPorMes(mesSeleccionado, añoSeleccionado);
                    break;

                case 'personalizado':
                    if (!fechaInicio || !fechaFin) {
                        console.warn('⚠️ [Historial] No hay rango de fechas');
                        setError('Por favor selecciona un rango de fechas');
                        setLoading(false);
                        return;
                    }
                    data = await buscarPorRango(fechaInicio, fechaFin);
                    break;

                case 'sicario':
                    if (!filtroSicario) {
                        console.warn('⚠️ [Historial] No hay sicario seleccionado');
                        setError('Por favor selecciona un sicario');
                        setLoading(false);
                        return;
                    }
                    data = await buscarPorSicario(filtroSicario);
                    break;

                default:
                    console.warn('⚠️ [Historial] Tipo de filtro no válido:', tipoFiltro);
                    setError('Tipo de filtro no válido');
                    setLoading(false);
                    return;
            }

            console.log('📊 [Historial] Datos recibidos:', data.length);
            setResultados(data);
            
            if (data.length === 0) {
                console.warn('⚠️ [Historial] No se encontraron resultados');
            }
        } catch (error: any) {
            console.error('❌ [Historial] Error en la búsqueda:', error);
            setError(error.message || 'Error al buscar chinazos');
            setResultados([]);
        } finally {
            setLoading(false);
        }
    }, [tipoFiltro, mesSeleccionado, añoSeleccionado, fechaInicio, fechaFin, filtroSicario, buscarPorMes, buscarPorRango, buscarPorSicario]);

    // Función para limpiar filtros y resultados
    const handleLimpiar = useCallback(() => {
        console.log('🔄 [Historial] handleLimpiar');
        setMesSeleccionado('');
        setAñoSeleccionado('');
        setFechaInicio('');
        setFechaFin('');
        setFiltroSicario('');
        setResultados([]);
        setHaBuscado(false);
        setError(null);
    }, []);

    // Utilidades
    const getNombreMes = useCallback((mes: string) => {
        const meses: { [key: string]: string } = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
            '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
            '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        return meses[mes] || mes;
    }, []);

    // ✅ CORREGIDO: formatearFecha ahora maneja YYYY/MM/DD
    const formatearFecha = useCallback((fecha: string) => {
        if (!fecha) return 'Fecha no disponible';
        try {
            // La fecha viene como YYYY/MM/DD desde la BD
            const partes = fecha.split('/');
            if (partes.length === 3) {
                const year = parseInt(partes[0]);
                const month = parseInt(partes[1]) - 1;
                const day = parseInt(partes[2]);
                const date = new Date(year, month, day);
                return date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            return fecha;
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return fecha;
        }
    }, []);

    // Generar años disponibles (del 2026 al 2029)
    const añosDisponibles = useCallback(() => {
        return AÑOS_DISPONIBLES;
    }, []);

    const mesesDisponibles = useCallback(() => {
        return [
            { key: '01', label: 'Enero' },
            { key: '02', label: 'Febrero' },
            { key: '03', label: 'Marzo' },
            { key: '04', label: 'Abril' },
            { key: '05', label: 'Mayo' },
            { key: '06', label: 'Junio' },
            { key: '07', label: 'Julio' },
            { key: '08', label: 'Agosto' },
            { key: '09', label: 'Septiembre' },
            { key: '10', label: 'Octubre' },
            { key: '11', label: 'Noviembre' },
            { key: '12', label: 'Diciembre' }
        ];
    }, []);

    return {
        // Estados
        tipoFiltro,
        setTipoFiltro,
        mesSeleccionado,
        setMesSeleccionado,
        añoSeleccionado,
        setAñoSeleccionado,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        filtroSicario,
        setFiltroSicario,
        resultados,
        haBuscado,
        loading,
        error,
        sicarios,
        loadingSicarios,
        
        // Acciones
        handleBuscar,
        handleLimpiar,
        
        // Utilidades
        getNombreMes,
        formatearFecha,
        getImageUrl,
        añosDisponibles: añosDisponibles(),
        mesesDisponibles: mesesDisponibles(),
    };
};