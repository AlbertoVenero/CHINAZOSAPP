// src/controllers/ganador.controller.js
const GanadorCtrl = {};
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

const validarMes = (mes) => {
    return mes && /^\d{4}-\d{2}$/.test(mes);
};

// ============================================================
// CRUD DE GANADORES
// ============================================================

// Obtener todos los ganadores
GanadorCtrl.getGanadores = async (req, res) => {
    try {
        const { mes } = req.query;
        console.log(`📋 [GANADORES] Obteniendo ganadores${mes ? ` para mes: ${mes}` : ''}`);
        
        let query = `
            SELECT 
                g.id,
                g.mes,
                g.total_votos,
                g.total_votantes,
                g.porcentaje,
                g.fecha_registro,
                c.id AS chinazo_id,
                c.chinazo AS texto_chinazo,
                s.id AS sicario_id,
                s.nombre AS sicario_nombre,
                s.alias AS sicario_alias,
                s.foto AS sicario_foto
            FROM ganadores g
            JOIN chinazos c ON g.chinazo_id = c.id
            JOIN sicarios s ON c.quien_dijo_id = s.id
        `;
        const params = [];
        
        if (mes && mes !== 'todos') {
            query += ` WHERE g.mes = ?`;
            params.push(mes);
        }
        
        query += ` ORDER BY g.mes DESC`;
        
        const ganadores = await pool.query(query, params);
        console.log(`✅ [GANADORES] ${ganadores.length} ganadores encontrados`);
        res.json(ganadores);
    } catch (error) {
        console.error('❌ [GANADORES] Error al obtener ganadores:', error);
        res.status(500).json({ mensaje: 'Error al obtener ganadores' });
    }
};

// Obtener ganador de un mes específico
GanadorCtrl.getGanadorByMes = async (req, res) => {
    try {
        const { mes } = req.params;
        
        console.log(`🔍 [GANADORES] Buscando ganador para mes: ${mes}`);
        
        if (!validarMes(mes)) {
            console.log(`❌ [GANADORES] Formato de mes inválido: ${mes}`);
            return res.status(400).json({ 
                mensaje: 'Formato de mes inválido. Use YYYY-MM' 
            });
        }
        
        const query = `
            SELECT 
                g.id,
                g.mes,
                g.total_votos,
                g.total_votantes,
                g.porcentaje,
                g.fecha_registro,
                c.id AS chinazo_id,
                c.chinazo AS texto_chinazo,
                s.id AS sicario_id,
                s.nombre AS sicario_nombre,
                s.alias AS sicario_alias,
                s.foto AS sicario_foto
            FROM ganadores g
            JOIN chinazos c ON g.chinazo_id = c.id
            JOIN sicarios s ON c.quien_dijo_id = s.id
            WHERE g.mes = ?
        `;
        
        const ganador = await pool.query(query, [mes]);
        
        if (ganador.length === 0) {
            console.log(`ℹ️ [GANADORES] No hay ganador para ${mes}`);
            return res.status(404).json({ 
                mensaje: 'No hay ganador para este mes' 
            });
        }
        
        console.log(`✅ [GANADORES] Ganador encontrado para ${mes}: ${ganador[0].sicario_alias}`);
        res.json(ganador[0]);
    } catch (error) {
        console.error('❌ [GANADORES] Error al obtener ganador por mes:', error);
        res.status(500).json({ mensaje: 'Error al obtener ganador' });
    }
};

// Calcular y guardar ganador del mes
GanadorCtrl.calcularGanadorMes = async (req, res) => {
    try {
        const { mes } = req.body;
        
        console.log(`📝 [GANADORES] Calculando ganador para mes: ${mes}`);
        
        if (!validarMes(mes)) {
            console.log(`❌ [GANADORES] Formato de mes inválido: ${mes}`);
            return res.status(400).json({ 
                mensaje: 'Formato de mes inválido. Use YYYY-MM' 
            });
        }
        
        // ✅ Verificar si ya existe ganador para este mes
        const existe = await pool.query('SELECT id FROM ganadores WHERE mes = ?', [mes]);
        if (existe.length > 0) {
            console.log(`⚠️ [GANADORES] Ya existe ganador para ${mes}`);
            return res.status(400).json({ 
                mensaje: 'Ya existe un ganador para este mes' 
            });
        }
        
        // ✅ CONVERTIR el mes de 'YYYY-MM' a 'YYYY/MM' para que coincida con la base de datos
        const mesFormateado = mes.replace('-', '/');
        console.log(`📝 [GANADORES] Buscando chinazos con fecha: ${mesFormateado}`);
        
        // ✅ CORREGIDO: Usar el mes formateado para la búsqueda
        const query = `
            SELECT 
                c.id,
                c.chinazo,
                COUNT(v.id) AS total_votos,
                COUNT(DISTINCT v.device_id) AS total_votantes
            FROM chinazos c
            LEFT JOIN votos v ON c.id = v.chinazo_id
            WHERE SUBSTRING(c.fecha, 1, 7) = ?
            GROUP BY c.id
            ORDER BY total_votos DESC
            LIMIT 1
        `;
        
        console.log(`📊 [GANADORES] Ejecutando consulta con mes: ${mesFormateado}`);
        const resultado = await pool.query(query, [mesFormateado]);
        
        console.log(`📊 [GANADORES] Resultado:`, JSON.stringify(resultado, null, 2));
        
        if (resultado.length === 0) {
            console.log(`❌ [GANADORES] No hay chinazos para ${mes}`);
            return res.status(400).json({ 
                mensaje: `No hay chinazos para este mes (${mes})` 
            });
        }
        
        const ganador = resultado[0];
        
        if (ganador.total_votos === 0) {
            console.log(`❌ [GANADORES] No hay votos para ${mes}`);
            return res.status(400).json({ 
                mensaje: `No hay chinazos con votos para este mes (${mes})` 
            });
        }
        
        // ✅ Calcular porcentaje
        const totalVotantes = ganador.total_votantes || 1;
        const porcentaje = (ganador.total_votos / totalVotantes) * 100;
        
        console.log(`📊 [GANADORES] Ganador encontrado: "${ganador.chinazo}"`);
        console.log(`📊 [GANADORES] Votos: ${ganador.total_votos}, Votantes: ${totalVotantes}, %: ${porcentaje.toFixed(2)}%`);
        
        // ✅ Guardar ganador (guardar con formato YYYY-MM)
        const newGanador = {
            chinazo_id: ganador.id,
            mes: mes,  // Guardamos el mes original con formato YYYY-MM
            total_votos: ganador.total_votos,
            total_votantes: totalVotantes,
            porcentaje: Math.round(porcentaje * 100) / 100,
            fecha_registro: getFechaActual()
        };
        
        const result = await pool.query('INSERT INTO ganadores SET ?', newGanador);
        console.log(`✅ [GANADORES] Ganador guardado con ID: ${result.insertId}`);
        
        // ✅ Obtener el ganador completo con datos del sicario
        const ganadorCompleto = await pool.query(`
            SELECT 
                g.id,
                g.mes,
                g.total_votos,
                g.total_votantes,
                g.porcentaje,
                g.fecha_registro,
                c.id AS chinazo_id,
                c.chinazo AS texto_chinazo,
                s.id AS sicario_id,
                s.nombre AS sicario_nombre,
                s.alias AS sicario_alias,
                s.foto AS sicario_foto
            FROM ganadores g
            JOIN chinazos c ON g.chinazo_id = c.id
            JOIN sicarios s ON c.quien_dijo_id = s.id
            WHERE g.id = ?
        `, [result.insertId]);
        
        res.json({ 
            mensaje: `Ganador del mes ${mes} calculado exitosamente`, 
            ganador: ganadorCompleto[0] 
        });
        
    } catch (error) {
        console.error('❌ [GANADORES] Error al calcular ganador del mes:', error);
        console.error('❌ [GANADORES] SQL:', error.sql);
        res.status(500).json({ 
            mensaje: 'Error al calcular ganador del mes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar ganador del mes
GanadorCtrl.actualizarGanadorMes = async (req, res) => {
    try {
        const { mes } = req.params;
        
        console.log(`🔄 [GANADORES] Actualizando ganador para mes: ${mes}`);
        
        if (!validarMes(mes)) {
            console.log(`❌ [GANADORES] Formato de mes inválido: ${mes}`);
            return res.status(400).json({ 
                mensaje: 'Formato de mes inválido. Use YYYY-MM' 
            });
        }
        
        const existe = await pool.query('SELECT id FROM ganadores WHERE mes = ?', [mes]);
        if (existe.length === 0) {
            console.log(`❌ [GANADORES] No existe ganador para ${mes}`);
            return res.status(404).json({ 
                mensaje: 'No existe ganador para este mes' 
            });
        }
        
        // ✅ CONVERTIR el mes de 'YYYY-MM' a 'YYYY/MM' para la búsqueda
        const mesFormateado = mes.replace('-', '/');
        console.log(`📝 [GANADORES] Buscando chinazos con fecha: ${mesFormateado}`);
        
        const query = `
            SELECT 
                c.id,
                c.chinazo,
                COUNT(v.id) AS total_votos,
                COUNT(DISTINCT v.device_id) AS total_votantes
            FROM chinazos c
            LEFT JOIN votos v ON c.id = v.chinazo_id
            WHERE SUBSTRING(c.fecha, 1, 7) = ?
            GROUP BY c.id
            ORDER BY total_votos DESC
            LIMIT 1
        `;
        
        const resultado = await pool.query(query, [mesFormateado]);
        
        if (resultado.length === 0 || resultado[0].total_votos === 0) {
            console.log(`❌ [GANADORES] No hay chinazos con votos para ${mes}`);
            return res.status(400).json({ 
                mensaje: 'No hay chinazos con votos para este mes' 
            });
        }
        
        const ganador = resultado[0];
        const totalVotantes = ganador.total_votantes || 1;
        const porcentaje = (ganador.total_votos / totalVotantes) * 100;
        
        console.log(`📊 [GANADORES] Nuevo ganador: "${ganador.chinazo}"`);
        console.log(`📊 [GANADORES] Votos: ${ganador.total_votos}, Votantes: ${totalVotantes}, %: ${porcentaje.toFixed(2)}%`);
        
        const updateGanador = {
            chinazo_id: ganador.id,
            total_votos: ganador.total_votos,
            total_votantes: totalVotantes,
            porcentaje: Math.round(porcentaje * 100) / 100
        };
        
        await pool.query('UPDATE ganadores SET ? WHERE mes = ?', [updateGanador, mes]);
        console.log(`✅ [GANADORES] Ganador actualizado para ${mes}`);
        
        const ganadorActualizado = await pool.query(`
            SELECT 
                g.id,
                g.mes,
                g.total_votos,
                g.total_votantes,
                g.porcentaje,
                g.fecha_registro,
                c.id AS chinazo_id,
                c.chinazo AS texto_chinazo,
                s.id AS sicario_id,
                s.nombre AS sicario_nombre,
                s.alias AS sicario_alias,
                s.foto AS sicario_foto
            FROM ganadores g
            JOIN chinazos c ON g.chinazo_id = c.id
            JOIN sicarios s ON c.quien_dijo_id = s.id
            WHERE g.mes = ?
        `, [mes]);
        
        res.json({ 
            mensaje: 'Ganador del mes actualizado exitosamente', 
            ganador: ganadorActualizado[0] 
        });
        
    } catch (error) {
        console.error('❌ [GANADORES] Error al actualizar ganador del mes:', error);
        res.status(500).json({ 
            mensaje: 'Error al actualizar ganador del mes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar ganador de un mes
GanadorCtrl.deleteGanador = async (req, res) => {
    try {
        const { mes } = req.params;
        
        console.log(`🗑️ [GANADORES] Eliminando ganador para mes: ${mes}`);
        
        if (!validarMes(mes)) {
            console.log(`❌ [GANADORES] Formato de mes inválido: ${mes}`);
            return res.status(400).json({ 
                mensaje: 'Formato de mes inválido. Use YYYY-MM' 
            });
        }
        
        const existe = await pool.query('SELECT id FROM ganadores WHERE mes = ?', [mes]);
        if (existe.length === 0) {
            console.log(`❌ [GANADORES] No existe ganador para ${mes}`);
            return res.status(404).json({ 
                mensaje: 'No hay ganador para este mes' 
            });
        }
        
        await pool.query('DELETE FROM ganadores WHERE mes = ?', [mes]);
        console.log(`✅ [GANADORES] Ganador eliminado para ${mes}`);
        
        res.json({ 
            mensaje: 'Ganador eliminado exitosamente' 
        });
        
    } catch (error) {
        console.error('❌ [GANADORES] Error al eliminar ganador:', error);
        res.status(500).json({ 
            mensaje: 'Error al eliminar ganador',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = GanadorCtrl;