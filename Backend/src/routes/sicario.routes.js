// src/routes/sicario.routes.js
const { Router } = require('express');
const router = Router();
const SicarioCtrl = require('../controllers/sicario.controller');

// ============================================================
// RUTAS DE AUTENTICACIÓN (ESPECÍFICAS - VAN PRIMERO)
// ============================================================
router.post('/login', SicarioCtrl.login);
router.get('/verificar', SicarioCtrl.verificarSesion);
router.post('/logout', SicarioCtrl.logout);
router.put('/password/:id', SicarioCtrl.cambiarPassword);  // ✅ AHORA CON ID EN URL

// ============================================================
// RUTAS DE SICARIOS (CRUD - VAN DESPUÉS)
// ============================================================
router.get('/', SicarioCtrl.getSicarios);
router.post('/', SicarioCtrl.postSicario);
router.get('/:id', SicarioCtrl.getSicarioById);
router.put('/:id', SicarioCtrl.putSicario);
router.delete('/:id', SicarioCtrl.deleteSicario);

module.exports = router;