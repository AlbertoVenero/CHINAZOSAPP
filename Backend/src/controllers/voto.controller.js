// src/controllers/voto.controller.js
const VotoCtrl = {};
const pool = require('../models/datamysql');
const crypto = require('crypto'); // ✅ Para generar IDs únicos

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// Generar ID único para el dispositivo
function generarDeviceId(req) {
    // 1. Intentar obtener de la cookie
    let deviceId = req.cookies?.device_id;
    
    // 2. Si no existe, generar uno nuevo
    if (!deviceId) {
        // Combinar información del navegador para crear un ID único
        const userAgent = req.headers['user-agent'] || 'unknown';
        const acceptLang = req.headers['accept-language'] || 'unknown';
        const acceptEncoding = req.headers['accept-encoding'] || 'unknown';
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        
        // Crear hash único
        const hash = crypto.createHash('sha256');
        hash.update(`${userAgent}-${acceptLang}-${acceptEncoding}-${timestamp}-${random}`);
        deviceId = hash.digest('hex').substring(0, 32);
        
        console.log(`🆕 [DEVICE] Nuevo ID generado: ${deviceId}`);
    } else {
        console.log(`🔄 [DEVICE] ID existente: ${deviceId}`);
    }
    
    return deviceId;
}

// Obtener fecha actual en formato YYYY/MM/DD
const getFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

// ============================================================
// VOTOS CON CONTROL POR DISPOSITIVO
// ============================================================

// Registrar un voto (con control por dispositivo)
VotoCtrl.postVoto = async (req, res) => {
    try {
        const { chinazo_id } = req.body;
        
        console.log('📝 [VOTO] ============================');
        console.log('📝 [VOTO] Body:', req.body);
        console.log('📝 [VOTO] Cookies:', req.cookies);
        
        // Validaciones
        if (!chinazo_id) {
            console.log('❌ [VOTO] chinazo_id faltante');
            return res.status(400).json({ 
                mensaje: 'chinazo_id es obligatorio' 
            });
        }
        
        // Verificar si el chinazo existe
        const chinazo = await pool.query('SELECT id, chinazo FROM chinazos WHERE id = ?', [chinazo_id]);
        if (chinazo.length === 0) {
            console.log('❌ [VOTO] Chinazo no encontrado:', chinazo_id);
            return res.status(404).json({ mensaje: 'Chinazo no encontrado' });
        }
        
        console.log(`📝 [VOTO] Chinazo encontrado: "${chinazo[0].chinazo}"`);
        
        // ✅ Obtener o generar device_id
        const deviceId = generarDeviceId(req);
        console.log(`📝 [VOTO] Device ID: ${deviceId}`);
        
        // ✅ Verificar si ya votó desde este dispositivo
        const votoExistente = await pool.query(
            'SELECT id, fecha_voto FROM votos WHERE chinazo_id = ? AND device_id = ?',
            [chinazo_id, deviceId]
        );
        
        if (votoExistente.length > 0) {
            console.log(`❌ [VOTO] Ya votó desde este dispositivo: ${deviceId}`);
            console.log(`📅 [VOTO] Voto anterior: ${votoExistente[0].fecha_voto}`);
            return res.status(400).json({ 
                mensaje: 'Ya has votado por este chinazo desde este dispositivo' 
            });
        }
        
        // ✅ Registrar el voto
        const fechaActual = getFechaActual();
        
        const newVoto = { 
            chinazo_id, 
            device_id: deviceId,
            fecha_voto: fechaActual,
            fecha_registro: fechaActual
        };
        
        console.log('📝 [VOTO] Insertando voto:', newVoto);
        
        const result = await pool.query('INSERT INTO votos SET ?', newVoto);
        console.log(`✅ [VOTO] Voto registrado ID: ${result.insertId}`);
        
        // ✅ Establecer cookie para mantener el dispositivo
        res.cookie('device_id', deviceId, {
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        console.log(`✅ [VOTO] Cookie establecida: device_id=${deviceId}`);
        
        // ✅ Obtener el total de votos actualizado
        const totalVotos = await pool.query(
            'SELECT COUNT(*) as total FROM votos WHERE chinazo_id = ?',
            [chinazo_id]
        );
        
        console.log(`✅ [VOTO] Total votos actual: ${totalVotos[0].total}`);
        console.log('📝 [VOTO] ============================');
        
        res.status(201).json({ 
            mensaje: 'Voto registrado exitosamente',
            id: result.insertId,
            chinazo_id,
            total_votos: totalVotos[0].total,
            device_id: deviceId
        });
        
    } catch (error) {
        console.error('❌ [VOTO] Error al registrar voto:', error);
        console.error('❌ [VOTO] Stack:', error.stack);
        
        // Manejar error de duplicado (índice único)
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('❌ [VOTO] Voto duplicado detectado por índice único');
            return res.status(400).json({ 
                mensaje: 'Ya has votado por este chinazo desde este dispositivo' 
            });
        }
        
        res.status(500).json({ 
            mensaje: 'Error al registrar voto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener conteo de votos por chinazo
VotoCtrl.getConteoVotos = async (req, res) => {
    try {
        console.log('📊 [VOTO] Obteniendo conteo de votos');
        
        const query = `
            SELECT 
                c.id,
                c.chinazo,
                c.fecha,
                s.id AS quien_dijo_id,
                s.nombre AS quien_dijo_nombre,
                s.alias AS quien_dijo_alias,
                s.foto AS quien_dijo_foto,
                COUNT(v.id) AS total_votos
            FROM chinazos c
            LEFT JOIN votos v ON c.id = v.chinazo_id
            JOIN sicarios s ON c.quien_dijo_id = s.id
            GROUP BY c.id
            ORDER BY total_votos DESC
        `;
        const conteo = await pool.query(query);
        
        console.log(`✅ [VOTO] ${conteo.length} chinazos con conteo de votos`);
        res.json(conteo);
    } catch (error) {
        console.error('❌ [VOTO] Error al obtener conteo de votos:', error);
        res.status(500).json({ mensaje: 'Error al obtener conteo de votos' });
    }
};

// Obtener votos de un chinazo específico
VotoCtrl.getVotosByChinazo = async (req, res) => {
    try {
        const { chinazo_id } = req.params;
        
        console.log(`📊 [VOTO] Obteniendo votos para chinazo ${chinazo_id}`);
        
        // Verificar si el chinazo existe
        const chinazo = await pool.query('SELECT id FROM chinazos WHERE id = ?', [chinazo_id]);
        if (chinazo.length === 0) {
            console.log('❌ [VOTO] Chinazo no encontrado:', chinazo_id);
            return res.status(404).json({ mensaje: 'Chinazo no encontrado' });
        }
        
        const query = `
            SELECT 
                id,
                chinazo_id,
                device_id,
                fecha_voto,
                fecha_registro
            FROM votos 
            WHERE chinazo_id = ?
            ORDER BY fecha_voto DESC
        `;
        const votos = await pool.query(query, [chinazo_id]);
        
        console.log(`✅ [VOTO] ${votos.length} votos encontrados para chinazo ${chinazo_id}`);
        res.json(votos);
    } catch (error) {
        console.error('❌ [VOTO] Error al obtener votos:', error);
        res.status(500).json({ mensaje: 'Error al obtener votos' });
    }
};

// ✅ NUEVO: Verificar si el dispositivo ya votó por un chinazo
VotoCtrl.verificarVoto = async (req, res) => {
    try {
        const { chinazo_id } = req.params;
        const deviceId = req.cookies?.device_id;
        
        console.log(`🔍 [VOTO] Verificando voto para chinazo ${chinazo_id}`);
        console.log(`🔍 [VOTO] Device ID: ${deviceId || 'no existe'}`);
        
        if (!deviceId) {
            return res.json({ 
                yaVoto: false,
                mensaje: 'No hay dispositivo registrado'
            });
        }
        
        const voto = await pool.query(
            'SELECT id, fecha_voto FROM votos WHERE chinazo_id = ? AND device_id = ?',
            [chinazo_id, deviceId]
        );
        
        if (voto.length > 0) {
            console.log(`✅ [VOTO] Ya votó: ${voto[0].fecha_voto}`);
            return res.json({
                yaVoto: true,
                fecha_voto: voto[0].fecha_voto
            });
        } else {
            console.log('❌ [VOTO] No ha votado');
            return res.json({
                yaVoto: false
            });
        }
    } catch (error) {
        console.error('❌ [VOTO] Error al verificar voto:', error);
        res.status(500).json({ mensaje: 'Error al verificar voto' });
    }
};

module.exports = VotoCtrl;