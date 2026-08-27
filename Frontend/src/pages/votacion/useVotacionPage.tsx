// src/pages/votacion/useVotacionPage.tsx
import { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import ChinazoService from '../../services/ChinazoService.js';
// @ts-ignore
import VotoService from '../../services/VotoService.js';
// @ts-ignore
import SicarioService from '../../services/SicarioService.js';
// @ts-ignore
import apiService from '../../services/ApiService.js';
// @ts-ignore
import GanadorService from '../../services/GanadorService.js';

const chinazoService = new ChinazoService();
const votoService = new VotoService();
const sicarioService = new SicarioService();
const ganadorService = new GanadorService();

export interface ChinazoVotacion {
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
    yaVoto?: boolean;
}

export interface Sicario {
    id: number;
    nombre: string;
    alias: string;
    foto: string;
}

export const useVotacionPage = () => {
    // Estados
    const [chinazos, setChinazos] = useState<ChinazoVotacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, setMesActual] = useState<string>('');
    const [, setMesAnterior] = useState<string>('');
    const [mesSeleccionado, setMesSeleccionado] = useState<string>('');
    const [mesesDisponibles, setMesesDisponibles] = useState<{ key: string; label: string }[]>([]);
    const [sicarios, setSicarios] = useState<Sicario[]>([]);
    const [loadingSicarios, setLoadingSicarios] = useState(false);
    
    // Estado para los modales
    const [chinazoSeleccionado, setChinazoSeleccionado] = useState<ChinazoVotacion | null>(null);
    const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [modalFotoAbierto, setModalFotoAbierto] = useState(false);
    const [enviandoVoto, setEnviandoVoto] = useState(false);
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

    // ✅ Función para convertir fecha de YYYY/MM/DD a YYYY-MM
    const convertirFechaAMes = (fecha: string): string => {
        if (!fecha) return '';
        return fecha.substring(0, 7).replace('/', '-');
    };

    // Función para obtener URL de imagen
    const getImageUrl = (filename: string | null) => {
        return apiService.getImageUrl(filename);
    };

    // Obtener mes actual y anterior
    const obtenerMeses = useCallback(() => {
        const fechaActual = new Date();
        const year = fechaActual.getFullYear();
        const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const mesActualStr = `${year}-${month}`;
        
        let mesAnteriorYear = year;
        let mesAnteriorMonth = fechaActual.getMonth();
        if (mesAnteriorMonth === 0) {
            mesAnteriorMonth = 12;
            mesAnteriorYear = year - 1;
        }
        const mesAnteriorStr = `${mesAnteriorYear}-${String(mesAnteriorMonth).padStart(2, '0')}`;
        
        return { mesActual: mesActualStr, mesAnterior: mesAnteriorStr };
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        // console.log('🔄 useVotacionPage: Iniciando carga de datos iniciales');
        const { mesActual, mesAnterior } = obtenerMeses();
        setMesActual(mesActual);
        setMesAnterior(mesAnterior);
        cargarDatosIniciales(mesActual, mesAnterior);
    }, []);

    const cargarDatosIniciales = async (mesActual: string, mesAnterior: string) => {
        // console.log('🔄 cargarDatosIniciales: Iniciando...');
        setLoading(true);
        setError(null);
        try {
            // console.log('📥 cargarDatosIniciales: Cargando sicarios...');
            await cargarSicarios();
            
            const meses = [
                { key: mesActual, label: `Mes Actual (${getNombreMes(mesActual.split('-')[1])} ${mesActual.split('-')[0]})` }
            ];
            
            try {
                const ganador = await ganadorService.getGanadorByMes(mesAnterior);
                if (ganador) {
                    // console.log(`✅ [Votacion] El mes ${mesAnterior} ya tiene ganador`);
                    meses.push({ 
                        key: mesAnterior, 
                        label: `Mes Anterior (${getNombreMes(mesAnterior.split('-')[1])} ${mesAnterior.split('-')[0]}) - 🏆 Ganador` 
                    });
                } else {
                    // console.log(`ℹ️ [Votacion] El mes ${mesAnterior} aún no tiene ganador`);
                }
            } catch (error) {
                // console.log(`ℹ️ [Votacion] El mes ${mesAnterior} aún no tiene ganador`);
            }
            
            // console.log('📊 cargarDatosIniciales: Meses disponibles:', meses);
            setMesesDisponibles(meses);
            
            setMesSeleccionado(mesActual);
            await cargarChinazosPorMes(mesActual);
            
        } catch (error) {
            // console.error('❌ cargarDatosIniciales: Error:', error);
            setError('Error al cargar los datos iniciales');
        } finally {
            setLoading(false);
            // console.log('✅ cargarDatosIniciales: Finalizado');
        }
    };

    const cargarSicarios = async () => {
        // console.log('🔄 cargarSicarios: Iniciando...');
        setLoadingSicarios(true);
        try {
            const data = await sicarioService.getSicarios();
            // console.log('✅ cargarSicarios: Sicarios cargados:', data.length);
            setSicarios(data);
        } catch (error) {
            // console.error('❌ cargarSicarios: Error:', error);
            throw error;
        } finally {
            setLoadingSicarios(false);
        }
    };

    const cargarChinazosPorMes = useCallback(async (mes: string) => {
        if (!mes) {
            // console.error('❌ cargarChinazosPorMes: mes es undefined o vacío');
            setError('No se ha seleccionado un mes válido');
            return;
        }
        
        // console.log(`🔄 cargarChinazosPorMes: Cargando chinazos para ${mes}...`);
        setLoading(true);
        setError(null);
        setMensaje(null);
        
        try {
            const [year, month] = mes.split('-');
            
            const filtros = {
                tipo: 'mes',
                mes: month,
                año: year
            };
            
            // console.log('📤 cargarChinazosPorMes: Enviando filtros:', filtros);
            const data = await chinazoService.getChinazosFiltrados(filtros);
            // console.log(`✅ cargarChinazosPorMes: Chinazos recibidos: ${data.length}`);
            
            const chinazosConVotos = await Promise.all(
                data.map(async (chinazo: any) => {
                    try {
                        const votos = await votoService.getVotosByChinazo(chinazo.id);
                        const totalVotos = votos.length;
                        
                        // console.log(`🔍 [Voto] Chinazo - ID: ${chinazo.id}, Texto: "${chinazo.chinazo}"`);
                        
                        let yaVoto = false;
                        try {
                            const verificacion = await votoService.verificarVoto(chinazo.id);
                            yaVoto = verificacion.yaVoto || false;
                            // console.log(`   🔍 Verificación: ${yaVoto ? '✅ YA VOTÓ' : '❌ No ha votado'}`);
                            // console.log(`   📊 Total votos: ${totalVotos}`);
                        } catch (error) {
                            // console.warn(`⚠️ No se pudo verificar voto para chinazo ${chinazo.id}:`, error);
                        }
                        
                        return {
                            ...chinazo,
                            total_votos: totalVotos,
                            yaVoto: yaVoto
                        };
                    } catch (error) {
                        // console.error(`Error al obtener datos para chinazo ${chinazo.id}:`, error);
                        return {
                            ...chinazo,
                            total_votos: 0,
                            yaVoto: false
                        };
                    }
                })
            );
            
            // console.log('✅ cargarChinazosPorMes: Chinazos con votos procesados:', chinazosConVotos.length);
            
            // console.log('📊 [VOTOS] Resumen de chinazos:');
            setChinazos(chinazosConVotos);
            
            if (chinazosConVotos.length === 0) {
                // console.warn('⚠️ cargarChinazosPorMes: No hay chinazos para este mes');
                setError('No hay chinazos en este mes');
            } else {
                // console.log(`✅ cargarChinazosPorMes: ${chinazosConVotos.length} chinazos cargados`);
            }
        } catch (error) {
            // console.error('❌ cargarChinazosPorMes: Error:', error);
            setError('Error al cargar los chinazos');
            setChinazos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCambiarMes = useCallback(async (mes: string) => {
        if (!mes) {
            // console.error('❌ handleCambiarMes: mes es undefined o vacío');
            return;
        }
        // console.log(`🔄 handleCambiarMes: Cambiando a mes ${mes}`);
        setMesSeleccionado(mes);
        
        const { mesActual } = obtenerMeses();
        if (mes === mesActual) {
            await cargarChinazosPorMes(mes);
        } else {
            await cargarChinazosPorMes(mes);
            setMensaje({
                texto: 'ℹ️ Este mes ya pasó. Los chinazos de meses anteriores no se pueden votar.',
                tipo: 'error'
            });
        }
    }, [cargarChinazosPorMes]);

    // ============================================================
    // FUNCIONES PARA MODALES
    // ============================================================

    const abrirModalConfirmacion = (chinazo: ChinazoVotacion) => {
        /*
        console.log('🔓 [Modal] abrirModalConfirmacion - Chinazo:', {
            id: chinazo.id,
            texto: chinazo.chinazo,
            fecha: chinazo.fecha,
            yaVoto: chinazo.yaVoto,
            total_votos: chinazo.total_votos
        });
        */
        
        // ✅ CORREGIDO: Usar la función convertirFechaAMes
        const { mesActual } = obtenerMeses();
        const chinazoMes = convertirFechaAMes(chinazo.fecha);
        
        // console.log(`🔍 [Modal] Mes chinazo: ${chinazoMes}, Mes actual: ${mesActual}`);
        
        if (chinazoMes !== mesActual) {
            // console.log('❌ [Modal] Chinazo NO es del mes actual');
            setMensaje({
                texto: '❌ No puedes votar por chinazos de meses anteriores',
                tipo: 'error'
            });
            return;
        }
        
        if (chinazo.yaVoto) {
            // console.log('❌ [Modal] Usuario YA votó por este chinazo');
            setMensaje({
                texto: '⚠️ Ya has votado por este chinazo',
                tipo: 'error'
            });
            return;
        }
        
        // console.log('✅ [Modal] Chinazo válido para votar - Abriendo modal de confirmación');
        setChinazoSeleccionado(chinazo);
        setModalConfirmacionAbierto(true);
    };

    const cerrarModalConfirmacion = () => {
        // console.log('🔒 cerrarModalConfirmacion');
        setModalConfirmacionAbierto(false);
        setChinazoSeleccionado(null);
    };

    const abrirModalDetalle = (chinazo: ChinazoVotacion) => {
        /*
        console.log('🔓 abrirModalDetalle:', {
            id: chinazo.id,
            texto: chinazo.chinazo,
            yaVoto: chinazo.yaVoto
        });
        */
        setChinazoSeleccionado(chinazo);
        setModalDetalleAbierto(true);
    };

    const cerrarModalDetalle = () => {
        // console.log('🔒 cerrarModalDetalle');
        setModalDetalleAbierto(false);
        setChinazoSeleccionado(null);
    };

    const abrirModalFoto = (chinazo: ChinazoVotacion) => {
        // console.log('🔓 abrirModalFoto:', chinazo.id);
        setChinazoSeleccionado(chinazo);
        setModalFotoAbierto(true);
    };

    const cerrarModalFoto = () => {
        // console.log('🔒 cerrarModalFoto');
        setModalFotoAbierto(false);
        setChinazoSeleccionado(null);
    };

    // ============================================================
    // FUNCIÓN PARA CONFIRMAR VOTO (SOLO MES ACTUAL)
    // ============================================================

    const confirmarVoto = useCallback(async () => {
        // console.log('🔄 [Voto] ============================');
        // console.log('🔄 [Voto] confirmarVoto - Iniciando');
        
        if (!chinazoSeleccionado) {
            // console.warn('⚠️ confirmarVoto: No hay chinazo seleccionado');
            return;
        }

        // console.log(`🔄 [Voto] Chinazo seleccionado: ID ${chinazoSeleccionado.id} - "${chinazoSeleccionado.chinazo}"`);
        // console.log(`🔄 [Voto] yaVoto actual: ${chinazoSeleccionado.yaVoto}`);

        // ✅ CORREGIDO: Usar la función convertirFechaAMes
        const { mesActual } = obtenerMeses();
        const chinazoMes = convertirFechaAMes(chinazoSeleccionado.fecha);
        
        // console.log(`🔄 [Voto] Mes chinazo: ${chinazoMes}, Mes actual: ${mesActual}`);
        
        if (chinazoMes !== mesActual) {
            // console.log('❌ [Voto] Chinazo NO es del mes actual');
            setMensaje({
                texto: '❌ No puedes votar por chinazos de meses anteriores',
                tipo: 'error'
            });
            cerrarModalConfirmacion();
            return;
        }

        // console.log(`📤 [Voto] Enviando voto para chinazo ${chinazoSeleccionado.id}`);
        setEnviandoVoto(true);
        
        try {
            await votoService.postVoto(chinazoSeleccionado.id);
            // console.log('✅ [Voto] Respuesta del servidor:', response);
            
            // console.log('🔄 [Voto] Recargando chinazos para actualizar estados...');
            await cargarChinazosPorMes(mesSeleccionado);
            
            cerrarModalConfirmacion();
            cerrarModalDetalle();
            
            setMensaje({
                texto: '✅ ¡Voto registrado exitosamente!',
                tipo: 'success'
            });
            
            // console.log('✅ [Voto] Voto completado exitosamente');
            
            setTimeout(() => {
                // console.log('🧹 [Voto] Limpiando mensaje');
                setMensaje(null);
            }, 3000);
            
        } catch (error: any) {
            // console.error('❌ [Voto] Error al votar:', error);
            // console.error('❌ [Voto] Stack:', error.stack);
            
            let mensajeError = error.message || 'Error al registrar el voto';
            if (mensajeError.includes('Ya has votado')) {
                mensajeError = '⚠️ Ya has votado por este chinazo';
            }
            setMensaje({
                texto: mensajeError,
                tipo: 'error'
            });
        } finally {
            setEnviandoVoto(false);
            // console.log('🔄 [Voto] ============================');
        }
    }, [chinazoSeleccionado, cargarChinazosPorMes, mesSeleccionado]);

    // ============================================================
    // FUNCIONES DE UTILIDAD
    // ============================================================

    const getNombreMes = (mes: string) => {
        const meses: { [key: string]: string } = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
            '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
            '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        return meses[mes] || mes;
    };

    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'Fecha no disponible';
        try {
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
        } catch {
            return fecha;
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================

    return {
        // Estados
        chinazos,
        loading,
        error,
        mensaje,
        mesSeleccionado,
        mesesDisponibles,
        sicarios,
        loadingSicarios,
        chinazoSeleccionado,
        modalConfirmacionAbierto,
        modalDetalleAbierto,
        modalFotoAbierto,
        enviandoVoto,
        
        // Funciones
        handleCambiarMes,
        abrirModalConfirmacion,
        cerrarModalConfirmacion,
        abrirModalDetalle,
        cerrarModalDetalle,
        abrirModalFoto,
        cerrarModalFoto,
        confirmarVoto,
        getImageUrl,
        formatearFecha,
        getNombreMes,
        obtenerMeses,
        cargarChinazosPorMes,
        convertirFechaAMes // ✅ Exportar para usar en el componente si es necesario
    };
};