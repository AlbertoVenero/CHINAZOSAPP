// src/pages/sicarios/useSicariosPage.ts
import { useState, useEffect, useRef } from 'react';
// @ts-ignore
import SicarioService from '../../services/SicarioService.js';
// @ts-ignore
import UploadService from '../../services/UploadService.js';
// @ts-ignore
import apiService from '../../services/ApiService.js';

// Crear instancias de los servicios
const sicarioService = new SicarioService();
const uploadService = new UploadService();

export interface Sicario {
    id: number;
    nombre: string;
    alias: string;
    foto: string;
    fecha_registro: string;
}

export const useSicariosPage = () => {
    // Estados
    const [sicarios, setSicarios] = useState<Sicario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sicarioEditando, setSicarioEditando] = useState<Sicario | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        alias: '',
        foto: ''
    });
    const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
    const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalFotoAbierto, setModalFotoAbierto] = useState(false);
    const [fotoParaModal, setFotoParaModal] = useState<string | null>(null);
    const [aliasParaModal, setAliasParaModal] = useState<string>('');
    const [enviando, setEnviando] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Función para obtener URL de imagen
    const getImageUrl = (filename: string | null) => {
        console.log('🖼️ getImageUrl:', filename);
        return apiService.getImageUrl(filename);
    };

    // Cargar sicarios al inicio
    useEffect(() => {
        console.log('🔄 useSicariosPage: Cargando sicarios...');
        cargarSicarios();
    }, []);

    // ============================================================
    // CRUD DE SICARIOS
    // ============================================================

    const cargarSicarios = async () => {
        console.log('🔄 cargarSicarios: Iniciando...');
        setLoading(true);
        setError(null);
        try {
            const data = await sicarioService.getSicarios();
            console.log('✅ cargarSicarios: Sicarios cargados:', data.length);
            setSicarios(data);
        } catch (error: any) {
            console.error('❌ cargarSicarios: Error:', error);
            setError(error.message || 'Error al cargar los sicarios');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // MODAL DE AGREGAR/EDITAR
    // ============================================================

    const abrirModal = (sicario?: Sicario) => {
        console.log('🔓 abrirModal:', sicario ? `Editando ${sicario.alias}` : 'Nuevo sicario');
        if (sicario) {
            setSicarioEditando(sicario);
            setFormData({
                nombre: sicario.nombre,
                alias: sicario.alias,
                foto: sicario.foto || ''
            });
            setFotoSeleccionada(getImageUrl(sicario.foto) || null);
            setArchivoFoto(null);
        } else {
            setSicarioEditando(null);
            setFormData({ nombre: '', alias: '', foto: '' });
            setFotoSeleccionada(null);
            setArchivoFoto(null);
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        console.log('🔒 cerrarModal');
        setModalAbierto(false);
        setSicarioEditando(null);
        setFormData({ nombre: '', alias: '', foto: '' });
        setFotoSeleccionada(null);
        setArchivoFoto(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ============================================================
    // MANEJO DE FOTOS
    // ============================================================

    const abrirModalFoto = (foto: string | null, alias: string) => {
        console.log('🔓 abrirModalFoto:', alias);
        const urlFoto = getImageUrl(foto) || '';
        setFotoParaModal(urlFoto);
        setAliasParaModal(alias);
        setModalFotoAbierto(true);
    };

    const cerrarModalFoto = () => {
        console.log('🔒 cerrarModalFoto');
        setModalFotoAbierto(false);
        setFotoParaModal(null);
        setAliasParaModal('');
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('📷 handleFotoChange: Archivo seleccionado:', file.name);
            setArchivoFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoSeleccionada(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const eliminarFoto = () => {
        console.log('🗑️ eliminarFoto');
        setFotoSeleccionada(null);
        setArchivoFoto(null);
        setFormData({ ...formData, foto: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ============================================================
    // GUARDAR Y ELIMINAR
    // ============================================================

    const handleGuardar = async () => {
        console.log('💾 handleGuardar: Iniciando...');
        
        // Validaciones
        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        if (!formData.alias.trim()) {
            setError('El alias es obligatorio');
            return;
        }

        setEnviando(true);
        setError(null);

        try {
            let nombreFoto = '';

            // Subir foto si hay una nueva
            if (archivoFoto) {
                const extension = archivoFoto.name.split('.').pop();
                const nombreBase = formData.alias.toLowerCase().replace(/ /g, '_');
                nombreFoto = `${nombreBase}.${extension}`;
                
                console.log('📤 handleGuardar: Subiendo foto:', nombreFoto);
                const nuevoArchivo = new File([archivoFoto], nombreFoto, { type: archivoFoto.type });
                await uploadService.uploadImage(nuevoArchivo);
                console.log('✅ handleGuardar: Foto subida correctamente');
            }

            const datosSicario = {
                nombre: formData.nombre.trim(),
                alias: formData.alias.trim(),
                foto: nombreFoto || formData.foto || ''
            };

            console.log('📤 handleGuardar: Datos del sicario:', datosSicario);

            if (sicarioEditando) {
                console.log(`📝 handleGuardar: Actualizando sicario ${sicarioEditando.id}`);
                await sicarioService.putSicario(sicarioEditando.id, datosSicario);
                alert('✅ Sicario actualizado exitosamente');
            } else {
                console.log('📝 handleGuardar: Creando nuevo sicario');
                await sicarioService.postSicario(datosSicario);
                alert('✅ Sicario creado exitosamente');
            }
            
            cerrarModal();
            await cargarSicarios();
            
        } catch (error: any) {
            console.error('❌ handleGuardar: Error:', error);
            setError(error.message || 'Error al guardar el sicario');
        } finally {
            setEnviando(false);
        }
    };

    const handleEliminar = async (id: number) => {
        const sicario = sicarios.find(s => s.id === id);
        if (!confirm(`¿Estás seguro de que quieres eliminar a "${sicario?.alias || 'este sicario'}"?`)) {
            return;
        }
        
        console.log(`🗑️ handleEliminar: Eliminando sicario ${id}`);
        try {
            await sicarioService.deleteSicario(id);
            alert('✅ Sicario eliminado exitosamente');
            await cargarSicarios();
        } catch (error: any) {
            console.error('❌ handleEliminar: Error:', error);
            alert(error.message || 'Error al eliminar el sicario');
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================

    return {
        // Estados
        sicarios,
        loading,
        error,
        formData,
        fotoSeleccionada,
        modalAbierto,
        modalFotoAbierto,
        fotoParaModal,
        aliasParaModal,
        sicarioEditando,
        enviando,
        fileInputRef,
        
        // Funciones
        abrirModal,
        cerrarModal,
        abrirModalFoto,
        cerrarModalFoto,
        handleFotoChange,
        eliminarFoto,
        handleGuardar,
        handleEliminar,
        setFormData,
        cargarSicarios,
        getImageUrl,
    };
};