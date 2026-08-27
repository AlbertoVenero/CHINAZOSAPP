// src/controllers/sicario.controller.js
const SicarioCtrl = {};
const pool = require('../models/datamysql');

// ============================================================
// SICARIOS - CRUD
// ============================================================

// Obtener todos los sicarios
SicarioCtrl.getSicarios = async (req, res) => {
    try {
        console.log('📋 [GET] Obteniendo todos los sicarios');
        const sicarios = await pool.query('SELECT id, nombre, alias, foto, fecha_registro FROM sicarios ORDER BY alias');
        console.log(`✅ [GET] ${sicarios.length} sicarios encontrados`);
        res.json(sicarios);
    } catch (error) {
        console.error('❌ [GET] Error al obtener sicarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener sicarios' });
    }
};

// Obtener un sicario por ID
SicarioCtrl.getSicarioById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📋 [GET] Obteniendo sicario ID: ${id}`);
        const sicario = await pool.query('SELECT id, nombre, alias, foto, fecha_registro FROM sicarios WHERE id = ?', [id]);
        if (sicario.length === 0) {
            console.log(`❌ [GET] Sicario ID ${id} no encontrado`);
            return res.status(404).json({ mensaje: 'Sicario no encontrado' });
        }
        console.log(`✅ [GET] Sicario encontrado: ${sicario[0].alias}`);
        res.json(sicario[0]);
    } catch (error) {
        console.error('❌ [GET] Error al obtener sicario:', error);
        res.status(500).json({ mensaje: 'Error al obtener sicario' });
    }
};

// Crear un nuevo sicario
SicarioCtrl.postSicario = async (req, res) => {
    try {
        const { nombre, alias, foto } = req.body;
        console.log(`📝 [POST] Creando sicario: ${alias}`);
        const fechaActual = getFechaActual();
        
        const newSicario = { 
            nombre, 
            alias, 
            foto: foto || '', 
            password: alias, // La contraseña es el alias
            fecha_registro: fechaActual 
        };
        
        await pool.query('INSERT INTO sicarios SET ?', newSicario);
        console.log(`✅ [POST] Sicario ${alias} creado exitosamente`);
        res.json({ mensaje: 'Sicario creado exitosamente' });
    } catch (error) {
        console.error('❌ [POST] Error al crear sicario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'El alias ya existe' });
        }
        res.status(500).json({ mensaje: 'Error al crear sicario' });
    }
};

// Actualizar un sicario (SOLO nombre, alias, foto - NO PASSWORD)
SicarioCtrl.putSicario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, alias, foto } = req.body;
        
        console.log(`📝 [PUT] Actualizando sicario ID: ${id}`);
        console.log(`📝 [PUT] Datos: nombre=${nombre}, alias=${alias}, foto=${foto}`);
        
        // Verificar que el sicario existe
        const existe = await pool.query('SELECT id FROM sicarios WHERE id = ?', [id]);
        if (existe.length === 0) {
            console.log(`❌ [PUT] Sicario ID ${id} no encontrado`);
            return res.status(404).json({ mensaje: 'Sicario no encontrado' });
        }
        
        // ✅ SOLO actualizar nombre, alias, foto (NO tocar password)
        const updateData = { nombre, alias, foto };
        await pool.query('UPDATE sicarios SET ? WHERE id = ?', [updateData, id]);
        console.log(`✅ [PUT] Sicario ID ${id} actualizado exitosamente`);
        res.json({ mensaje: 'Sicario actualizado exitosamente' });
    } catch (error) {
        console.error('❌ [PUT] Error al actualizar sicario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'El alias ya existe' });
        }
        res.status(500).json({ mensaje: 'Error al actualizar sicario' });
    }
};

// Eliminar un sicario
SicarioCtrl.deleteSicario = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ [DELETE] Eliminando sicario ID: ${id}`);
        
        const chinazos = await pool.query(
            'SELECT COUNT(*) as total FROM chinazos WHERE quien_dijo_id = ? OR anotado_por_id = ?', 
            [id, id]
        );
        
        if (chinazos[0].total > 0) {
            console.log(`❌ [DELETE] Sicario ID ${id} tiene chinazos asociados`);
            return res.status(400).json({ 
                mensaje: 'No se puede eliminar el sicario porque tiene chinazos asociados' 
            });
        }
        
        await pool.query('DELETE FROM sicarios WHERE id = ?', [id]);
        console.log(`✅ [DELETE] Sicario ID ${id} eliminado exitosamente`);
        res.json({ mensaje: 'Sicario eliminado exitosamente' });
    } catch (error) {
        console.error('❌ [DELETE] Error al eliminar sicario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar sicario' });
    }
};

// ============================================================
// AUTENTICACIÓN
// ============================================================

// Iniciar sesión (alias = contraseña)
SicarioCtrl.login = async (req, res) => {
    try {
        console.log('📝 [LOGIN] ============================');
        console.log('📝 [LOGIN] Body recibido:', req.body);
        
        const { alias, password } = req.body;
        
        console.log(`📝 [LOGIN] Alias: ${alias}, Password: ${password}`);
        
        if (!alias || !password) {
            console.log('❌ [LOGIN] Faltan campos');
            return res.status(400).json({ 
                mensaje: 'Alias y contraseña son obligatorios' 
            });
        }
        
        console.log(`🔍 [LOGIN] Buscando: alias = "${alias}", password = "${password}"`);
        
        const sicarios = await pool.query(
            'SELECT id, nombre, alias, foto FROM sicarios WHERE alias = ? AND password = ?',
            [alias, password]
        );
        
        console.log(`📊 [LOGIN] Resultado: ${sicarios.length} usuario(s) encontrado(s)`);
        
        if (sicarios.length === 0) {
            console.log('❌ [LOGIN] Credenciales incorrectas');
            return res.status(401).json({ 
                mensaje: 'Credenciales incorrectas' 
            });
        }
        
        const sicario = sicarios[0];
        console.log(`✅ [LOGIN] Usuario encontrado: ${sicario.alias} (ID: ${sicario.id})`);
        
        req.session.sicario = {
            id: sicario.id,
            nombre: sicario.nombre,
            alias: sicario.alias,
            foto: sicario.foto
        };
        
        console.log(`✅ [LOGIN] Sesión guardada:`, req.session.sicario);
        console.log('📝 [LOGIN] ============================');
        
        res.json({
            mensaje: 'Login exitoso',
            sicario: req.session.sicario
        });
    } catch (error) {
        console.error('❌ [LOGIN] Error en login:', error);
        console.error('❌ [LOGIN] Stack:', error.stack);
        res.status(500).json({ 
            mensaje: 'Error al iniciar sesión', 
            error: error.message 
        });
    }
};

// Verificar sesión
SicarioCtrl.verificarSesion = async (req, res) => {
    try {
        console.log('🔍 [VERIFICAR] Sesión actual:', req.session);
        
        if (req.session.sicario) {
            console.log(`✅ [VERIFICAR] Usuario autenticado: ${req.session.sicario.alias}`);
            res.json({
                autenticado: true,
                sicario: req.session.sicario
            });
        } else {
            console.log('❌ [VERIFICAR] No hay sesión activa');
            res.json({
                autenticado: false,
                sicario: null
            });
        }
    } catch (error) {
        console.error('❌ [VERIFICAR] Error al verificar sesión:', error);
        res.status(500).json({ mensaje: 'Error al verificar sesión' });
    }
};

// Cerrar sesión
SicarioCtrl.logout = async (req, res) => {
    try {
        console.log('📤 [LOGOUT] Cerrando sesión...');
        req.session.destroy();
        console.log('✅ [LOGOUT] Sesión destruida');
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error('❌ [LOGOUT] Error al cerrar sesión:', error);
        res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
};

// ============================================================
// CAMBIAR CONTRASEÑA (CON ID EN URL)
// ============================================================
SicarioCtrl.cambiarPassword = async (req, res) => {
    try {
        console.log('🔑 [PASSWORD] ============================');
        console.log('🔑 [PASSWORD] Params:', req.params);
        console.log('🔑 [PASSWORD] Body:', req.body);
        
        const { id } = req.params;  // ✅ Tomar ID de la URL
        const { password } = req.body;
        
        console.log(`🔑 [PASSWORD] ID de URL: ${id}, Tipo: ${typeof id}`);
        console.log(`🔑 [PASSWORD] Nueva Password: ${password}`);
        
        // Validaciones
        if (!id) {
            console.log('❌ [PASSWORD] ID no proporcionado');
            return res.status(400).json({ 
                mensaje: 'ID es obligatorio' 
            });
        }
        
        if (!password) {
            console.log('❌ [PASSWORD] Contraseña no proporcionada');
            return res.status(400).json({ 
                mensaje: 'Contraseña es obligatoria' 
            });
        }
        
        if (password.length < 3) {
            console.log('❌ [PASSWORD] Contraseña muy corta');
            return res.status(400).json({ 
                mensaje: 'La contraseña debe tener al menos 3 caracteres' 
            });
        }
        
        // Convertir id a número
        const idNumero = parseInt(id);
        console.log(`🔑 [PASSWORD] ID convertido: ${idNumero}`);
        
        if (isNaN(idNumero)) {
            console.log('❌ [PASSWORD] ID inválido');
            return res.status(400).json({ mensaje: 'ID inválido' });
        }
        
        // Verificar que el sicario existe
        const sicario = await pool.query('SELECT id, alias, foto FROM sicarios WHERE id = ?', [idNumero]);
        console.log(`🔑 [PASSWORD] Sicario encontrado:`, sicario);
        
        if (sicario.length === 0) {
            console.log('❌ [PASSWORD] Sicario no encontrado');
            return res.status(404).json({ mensaje: 'Sicario no encontrado' });
        }
        
        console.log(`🔑 [PASSWORD] Alias: ${sicario[0].alias}, Foto actual: ${sicario[0].foto}`);
        
        // ✅ SOLO actualizar la contraseña, NO tocar la foto
        const result = await pool.query('UPDATE sicarios SET password = ? WHERE id = ?', [password, idNumero]);
        console.log(`🔑 [PASSWORD] Resultado de UPDATE:`, result);
        
        // Verificar cuántas filas fueron afectadas
        const affectedRows = result.affectedRows || result.changedRows || 0;
        console.log(`🔑 [PASSWORD] Filas afectadas: ${affectedRows}`);
        
        if (affectedRows === 0) {
            console.log('❌ [PASSWORD] No se actualizó ninguna fila');
            return res.status(404).json({ mensaje: 'No se pudo actualizar la contraseña' });
        }
        
        // Verificar que la contraseña realmente cambió
        const verificar = await pool.query('SELECT id, alias, password FROM sicarios WHERE id = ?', [idNumero]);
        console.log(`🔑 [PASSWORD] Verificación final:`, verificar[0]);
        console.log(`🔑 [PASSWORD] Nueva contraseña: ${verificar[0].password}`);
        
        // ✅ Obtener los datos actualizados del sicario (sin password)
        const sicarioActualizado = await pool.query(
            'SELECT id, nombre, alias, foto FROM sicarios WHERE id = ?', 
            [idNumero]
        );
        
        console.log('✅ [PASSWORD] Contraseña actualizada exitosamente');
        console.log('🔑 [PASSWORD] ============================');
        
        res.json({ 
            mensaje: 'Contraseña actualizada exitosamente',
            sicario: sicarioActualizado[0]  // ✅ Devolver los datos del sicario actualizado
        });
    } catch (error) {
        console.error('❌ [PASSWORD] Error al cambiar contraseña:', error);
        console.error('❌ [PASSWORD] Stack:', error.stack);
        res.status(500).json({ 
            mensaje: 'Error al cambiar contraseña',
            error: error.message 
        });
    }
};

// ============================================================
// FUNCIÓN AUXILIAR
// ============================================================
const getFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

module.exports = SicarioCtrl;