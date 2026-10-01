const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');

// GET /api/hardware - Listar todos os aparelhos
router.get('/', hardwareController.getAllHardware);

// GET /api/hardware/:id - Obter um aparelho por ID
router.get('/:id', hardwareController.getHardwareById);

// POST /api/hardware - Criar um novo aparelho
router.post('/', hardwareController.createHardware);

// PUT /api/hardware/:id - Atualizar um aparelho existente
router.put('/:id', hardwareController.updateHardware);

// DELETE /api/hardware/:id - Excluir um aparelho existente
router.delete('/:id', hardwareController.deleteHardware);

module.exports = router;
