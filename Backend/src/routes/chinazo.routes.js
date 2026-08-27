// src/routes/chinazo.routes.js
const { Router } = require('express');
const router = Router();
const ChinazoCtrl = require('../controllers/chinazo.controller');

// ============================================================
// RUTAS DE CHINAZOS
// ============================================================

// ✅ IMPORTANTE: /filtros DEBE IR ANTES DE /:id
router.get('/filtros', ChinazoCtrl.getChinazosFiltrados);

// CRUD de chinazos
router.route('/')
    .get(ChinazoCtrl.getChinazos)
    .post(ChinazoCtrl.postChinazo);

router.route('/:id')
    .get(ChinazoCtrl.getChinazoById)
    .put(ChinazoCtrl.putChinazo)
    .delete(ChinazoCtrl.deleteChinazo);

module.exports = router;