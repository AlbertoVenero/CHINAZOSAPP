// src/controllers/chinazo.controller.js
const ChinazoCtrl = {};
const pool = require('../models/datamysql');

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

const getFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

// ============================================================
// CHINAZOS - CRUD
// ============================================================

// Obtener todos los chinazos
ChinazoCtrl.getChinazos = async (req, res) => {
    try {
        console.log('📋 [CHINAZOS] Obteniendo todos los chinazos');
        
        const query = `
            SELECT 
                c.id,
                c.chinazo,
                c.fecha,
                c.fecha_registro,
                s.id AS quien_dijo_id,
                s.nombre AS quien_dijo_nombre,
                s.alias AS quien_dijo_alias,
                s.foto AS quien_dijo_foto,
                a.id AS anotado_por_id,
                a.nombre AS anotado_por_nombre,
                a.alias AS anotado_por_alias,
                COUNT(v.id) AS total_votos
            FROM chinazos c
            JOIN sicarios s ON c.quien_dijo_id = s.id
            JOIN sicarios a ON c.anotado_por_id = a.id
            LEFT JOIN votos v ON c.id = v.chinazo_id
            GROUP BY c.id
            ORDER BY c.fecha DESC
        `;
        
        const chinazos = await pool.query(query);
        
        // ✅ Convertir total_votos a número
        const chinazosConVotos = chinazos.map(item => ({
            ...item,
            total_votos: parseInt(item.total_votos) || 0
        }));
        
        console.log(`✅ [CHINAZOS] ${chinazosConVotos.length} chinazos encontrados`);
        res.json(chinazosConVotos);
    } catch (error) {
        console.error('❌ [CHINAZOS] Error al obtener chinazos:', error);
        res.status(500).json({ mensaje: 'Error al obtener chinazos' });
    }
};

// Obtener chinazos con filtros (INCLUYE VOTOS)
ChinazoCtrl.getChinazosFiltrados = async (req, res) => {
    try {
        const { tipo, mes, año, fechaInicio, fechaFin, sicarioId } = req.query;
        
        console.log('📊 [CHINAZOS] Filtros recibidos:', { tipo, mes, año, fechaInicio, fechaFin, sicarioId });
        
        let query = `
            SELECT 
                c.id,
                c.chinazo,
                c.fecha,
                c.fecha_registro,
                s.id AS quien_dijo_id,
                s.nombre AS quien_dijo_nombre,
                s.alias AS quien_dijo_alias,
                s.foto AS quien_dijo_foto,
                a.id AS anotado_por_id,
                a.nombre AS anotado_por_nombre,
                a.alias AS anotado_por_alias,
                COUNT(v.id) AS total_votos
            FROM chinazos c
            JOIN sicarios s ON c.quien_dijo_id = s.id
            JOIN sicarios a ON c.anotado_por_id = a.id
            LEFT JOIN votos v ON c.id = v.chinazo_id
            WHERE 1=1
        `;
        const params = [];

        // ✅ Filtro por mes (formato YYYY/MM)
        if (tipo === 'mes' && mes && año) {
            query += ` AND SUBSTRING(c.fecha, 1, 7) = ?`;
            params.push(`${año}/${mes}`);
            console.log(`📊 [CHINAZOS] Filtrando por mes: ${año}/${mes}`);
        }

        // ✅ Filtro por rango de fechas (formato YYYY/MM/DD)
        if (tipo === 'personalizado' && fechaInicio && fechaFin) {
            const inicio = fechaInicio.replace(/-/g, '/');
            const fin = fechaFin.replace(/-/g, '/');
            query += ` AND c.fecha BETWEEN ? AND ?`;
            params.push(inicio, fin);
            console.log(`📊 [CHINAZOS] Filtrando por rango: ${inicio} - ${fin}`);
        }

        // ✅ Filtro por sicario (quien lo dijo)
        if (tipo === 'sicario' && sicarioId) {
            query += ` AND c.quien_dijo_id = ?`;
            params.push(sicarioId);
            console.log(`📊 [CHINAZOS] Filtrando por sicario ID: ${sicarioId}`);
        }

        query += ` GROUP BY c.id ORDER BY c.fecha DESC`;
        
        console.log('📊 [CHINAZOS] Query final:', query);
        console.log('📊 [CHINAZOS] Params:', params);
        
        const chinazos = await pool.query(query, params);
        
        // ✅ Convertir total_votos a número
        const chinazosConVotos = chinazos.map(item => ({
            ...item,
            total_votos: parseInt(item.total_votos) || 0
        }));
        
        console.log(`✅ [CHINAZOS] ${chinazosConVotos.length} chinazos encontrados`);
        res.json(chinazosConVotos);
    } catch (error) {
        console.error('❌ [CHINAZOS] Error al obtener chinazos filtrados:', error);
        res.status(500).json({ mensaje: 'Error al obtener chinazos filtrados' });
    }
};

// Crear un nuevo chinazo
ChinazoCtrl.postChinazo = async (req, res) => {
    try {
        const { quien_dijo_id, chinazo, fecha, anotado_por_id } = req.body;
        const fechaActual = getFechaActual();
        
        console.log(`📝 [CHINAZOS] Creando chinazo: "${chinazo}"`);
        
        // ✅ Convertir fecha de YYYY-MM-DD a YYYY/MM/DD
        const fechaFormateada = fecha.replace(/-/g, '/');
        
        const newChinazo = { 
            quien_dijo_id, 
            chinazo, 
            fecha: fechaFormateada, 
            anotado_por_id,
            fecha_registro: fechaActual
        };
        
        await pool.query('INSERT INTO chinazos SET ?', newChinazo);
        console.log(`✅ [CHINAZOS] Chinazo creado exitosamente`);
        res.json({ mensaje: 'Chinazo creado exitosamente' });
    } catch (error) {
        console.error('❌ [CHINAZOS] Error al crear chinazo:', error);
        res.status(500).json({ mensaje: 'Error al crear chinazo' });
    }
};

// Obtener un chinazo por ID
ChinazoCtrl.getChinazoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`📋 [CHINAZOS] Obteniendo chinazo ID: ${id}`);
        
        const query = `
            SELECT 
                c.id,
                c.chinazo,
                c.fecha,
                c.fecha_registro,
                s.id AS quien_dijo_id,
                s.nombre AS quien_dijo_nombre,
                s.alias AS quien_dijo_alias,
                s.foto AS quien_dijo_foto,
                a.id AS anotado_por_id,
                a.nombre AS anotado_por_nombre,
                a.alias AS anotado_por_alias,
                COUNT(v.id) AS total_votos
            FROM chinazos c
            JOIN sicarios s ON c.quien_dijo_id = s.id
            JOIN sicarios a ON c.anotado_por_id = a.id
            LEFT JOIN votos v ON c.id = v.chinazo_id
            WHERE c.id = ?
            GROUP BY c.id
        `;
        
        const chinazo = await pool.query(query, [id]);
        
        if (chinazo.length === 0) {
            console.log(`❌ [CHINAZOS] Chinazo ID ${id} no encontrado`);
            return res.status(404).json({ mensaje: 'Chinazo no encontrado' });
        }
        
        const chinazoConVotos = {
            ...chinazo[0],
            total_votos: parseInt(chinazo[0].total_votos) || 0
        };
        
        console.log(`✅ [CHINAZOS] Chinazo encontrado: "${chinazoConVotos.chinazo}"`);
        res.json(chinazoConVotos);
    } catch (error) {
        console.error('❌ [CHINAZOS] Error al obtener chinazo:', error);
        res.status(500).json({ mensaje: 'Error al obtener chinazo' });
    }
};

// Actualizar un chinazo
ChinazoCtrl.putChinazo = async (req, res) => {
    try {
        const { id } = req.params;
        const { quien_dijo_id, chinazo, fecha, anotado_por_id } = req.body;
        
        console.log(`📝 [CHINAZOS] Actualizando chinazo ID: ${id}`);
        
        const existe = await pool.query('SELECT id FROM chinazos WHERE id = ?', [id]);
        if (existe.length === 0) {
            console.log(`❌ [CHINAZOS] Chinazo ID ${id} no encontrado`);
            return res.status(404).json({ mensaje: 'Chinazo no encontrado' });
        }
        
        // ✅ Convertir fecha de YYYY-MM-DD a YYYY/MM/DD
        const fechaFormateada = fecha.replace(/-/g, '/');
        
        const updateData = { 
            quien_dijo_id, 
            chinazo, 
            fecha: fechaFormateada, 
            anotado_por_id 
        };
        
        await pool.query('UPDATE chinazos SET ? WHERE id = ?', [updateData, id]);
        console.log(`✅ [CHINAZOS] Chinazo ID ${id} actualizado`);
        res.json({ mensaje: 'Chinazo actualizado exitosamente' });
    } catch (error) {
        console.error('❌ [CHINAZOS] Error al actualizar chinazo:', error);
        res.status(500).json({ mensaje: 'Error al actualizar chinazo' });
    }
};

// Eliminar un chinazo
ChinazoCtrl.deleteChinazo = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️ [CHINAZOS] Eliminando chinazo ID: ${id}`);
        
        const existe = await pool.query('SELECT id FROM chinazos WHERE id = ?', [id]);
        if (existe.length === 0) {
            console.log(`❌ [CHINAZOS] Chinazo ID ${id} no encontrado`);
            return res.status(404).json({ mensaje: 'Chinazo no encontrado' });
        }
        
        // Eliminar votos asociados primero
        await pool.query('DELETE FROM votos WHERE chinazo_id = ?', [id]);
        console.log(`🗑️ [CHINAZOS] Votos eliminados para chinazo ID: ${id}`);
        
        // Eliminar el chinazo
        await pool.query('DELETE FROM chinazos WHERE id = ?', [id]);
        console.log(`✅ [CHINAZOS] Chinazo ID ${id} eliminado`);
        
        res.json({ mensaje: 'Chinazo eliminado exitosamente' });
    } catch (error) {
        console.error('❌ [CHINAZOS] Error al eliminar chinazo:', error);
        res.status(500).json({ mensaje: 'Error al eliminar chinazo' });
    }
};

module.exports = ChinazoCtrl;