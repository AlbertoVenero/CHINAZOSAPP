// src/pages/nuevo/useNuevoPage.tsx
import { useState, useEffect } from 'react';
// @ts-ignore
import SicarioService from '../../services/SicarioService.js';
// @ts-ignore
import ChinazoService from '../../services/ChinazoService.js';
// @ts-ignore
import apiService from '../../services/ApiService.js';
import { useAuth } from '../../contexts/AuthContext';  // ✅ Importar useAuth

const sicarioService = new SicarioService();
const chinazoService = new ChinazoService();

export interface Sicario {
    id: number;
    nombre: string;
    alias: string;
    foto: string;
}

export const useNuevoPage = () => {
    // ✅ Obtener el usuario autenticado del contexto
    const { user, isAuthenticated, isGuest } = useAuth();
    
    const [sicarios, setSicarios] = useState<Sicario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        quien_dijo_id: '',
        chinazo: '',
        fecha: '',
        anotado_por_id: ''  // ✅ Se llenará automáticamente
    });
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

    // Función para obtener URL de imagen
    const getImageUrl = (filename: string | null) => {
        return apiService.getImageUrl(filename);
    };

    useEffect(() => {
        console.log('🔄 useNuevoPage: Cargando sicarios...');
        cargarSicarios();
    }, []);

    // ✅ Efecto para establecer el anotado_por_id automáticamente
    useEffect(() => {
        if (user && user.id) {
            console.log(`👤 [useNuevoPage] Usuario autenticado: ${user.alias} (ID: ${user.id})`);
            setFormData(prev => ({
                ...prev,
                anotado_por_id: String(user.id)  // ✅ Asignar automáticamente
            }));
        } else if (isGuest) {
            console.log('👤 [useNuevoPage] Usuario invitado - no puede crear chinazos');
            // Opcional: mostrar mensaje de que el invitado no puede crear chinazos
        }
    }, [user, isGuest]);

    const cargarSicarios = async () => {
        setLoading(true);
        setError(null);
        console.log('🔄 Cargando sicarios desde SicarioService...');
        try {
            const data = await sicarioService.getSicarios();
            console.log('✅ Sicarios cargados:', data.length);
            setSicarios(data);
        } catch (error: any) {
            console.error('❌ Error al cargar sicarios:', error);
            setError(error.message || 'Error al cargar los sicarios');
            setMensaje({ texto: 'Error al cargar los sicarios', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getFechaActual = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, fecha: getFechaActual() }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje(null);
        setError(null);

        // ✅ Verificar que el usuario esté autenticado
        if (!isAuthenticated || !user) {
            setMensaje({ 
                texto: '⚠️ Debes iniciar sesión para registrar un chinazo', 
                tipo: 'error' 
            });
            return;
        }

        // Validaciones
        if (!formData.quien_dijo_id) {
            setMensaje({ texto: '⚠️ Selecciona quién lo dijo', tipo: 'error' });
            return;
        }
        if (!formData.chinazo.trim()) {
            setMensaje({ texto: '⚠️ Escribe el chinazo', tipo: 'error' });
            return;
        }
        if (!formData.fecha) {
            setMensaje({ texto: '⚠️ Selecciona una fecha', tipo: 'error' });
            return;
        }
        
        // ✅ Verificar que anotado_por_id esté establecido
        if (!formData.anotado_por_id) {
            setMensaje({ texto: '⚠️ No se pudo determinar quién anota el chinazo', tipo: 'error' });
            return;
        }

        setEnviando(true);

        try {
            const chinazoData = {
                quien_dijo_id: parseInt(formData.quien_dijo_id),
                chinazo: formData.chinazo.trim(),
                fecha: formData.fecha,
                anotado_por_id: parseInt(formData.anotado_por_id)  // ✅ Usuario autenticado
            };

            console.log('📤 Enviando chinazo:', chinazoData);
            console.log(`👤 Anotado por: ${user.alias} (ID: ${user.id})`);
            
            const response = await chinazoService.postChinazo(chinazoData);
            console.log('Chinazo registrado:', response);
            
            setMensaje({ texto: 'Chinazo registrado exitosamente', tipo: 'success' });
            
            // Limpiar formulario después de guardar exitosamente
            setFormData({
                quien_dijo_id: '',
                chinazo: '',
                fecha: getFechaActual(),
                anotado_por_id: String(user.id)  // ✅ Mantener el ID del usuario autenticado
            });

            // Cerrar mensaje después de 5 segundos
            setTimeout(() => {
                setMensaje(null);
            }, 5000);

        } catch (error: any) {
            console.error('❌ Error al guardar chinazo:', error);
            setMensaje({ 
                texto: error.message || '❌ Error al guardar el chinazo', 
                tipo: 'error' 
            });
        } finally {
            setEnviando(false);
        }
    };

    const limpiarFormulario = () => {
        console.log('🧹 Limpiando formulario');
        setFormData({
            quien_dijo_id: '',
            chinazo: '',
            fecha: getFechaActual(),
            anotado_por_id: user ? String(user.id) : ''  // ✅ Mantener el ID del usuario autenticado
        });
        setMensaje(null);
        setError(null);
    };

    return {
        sicarios,
        loading,
        error,
        formData,
        setFormData,
        enviando,
        mensaje,
        setMensaje,
        handleSubmit,
        limpiarFormulario,
        getImageUrl,
        cargarSicarios,
        // ✅ Exportar información del usuario para el componente
        user,
        isAuthenticated,
        isGuest
    };
};