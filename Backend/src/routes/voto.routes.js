// src/routes/voto.routes.js
const { Router } = require('express');
const router = Router();
const VotoCtrl = require('../controllers/voto.controller');

// ============================================================
// RUTAS DE VOTOS
// ============================================================

// 🔍 Verificar si ya votó (NUEVO)
router.get('/verificar/:chinazo_id', VotoCtrl.verificarVoto);

// 📊 Conteo de votos de todos los chinazos
router.get('/conteo', VotoCtrl.getConteoVotos);

// 📋 Obtener votos de un chinazo específico
router.get('/chinazo/:chinazo_id', VotoCtrl.getVotosByChinazo);

// ✅ Registrar un voto (con control por dispositivo)
router.post('/', VotoCtrl.postVoto);

module.exports = router;