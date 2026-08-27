// src/routes/ganador.routes.js
const { Router } = require('express');
const router = Router();
const GanadorCtrl = require('../controllers/ganador.controller');

router.route('/')
    .get(GanadorCtrl.getGanadores)
    .post(GanadorCtrl.calcularGanadorMes);

router.route('/mes/:mes')
    .get(GanadorCtrl.getGanadorByMes)
    .put(GanadorCtrl.actualizarGanadorMes)
    .delete(GanadorCtrl.deleteGanador);

module.exports = router;