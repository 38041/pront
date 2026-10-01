const mongoose = require('mongoose');
const Hardware = require('../models/Hardware');

/**
 * Utilitário para validar se uma string é um ObjectId válido do MongoDB.
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/**
 * GET /api/hardware
 * Retorna todos os aparelhos de hardware cadastrados, ordenados por data de criação descrescente.
 */
async function getAllHardware(req, res, next) {
  try {
    const items = await Hardware.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/hardware/:id
 * Retorna um aparelho específico pelo ID.
 */
async function getHardwareById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `O ID informado ('${id}') não é um identificador válido do MongoDB.`,
        },
      });
    }

    const item = await Hardware.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Aparelho de hardware não encontrado.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/hardware
 * Cadastra um novo aparelho de hardware.
 */
async function createHardware(req, res, next) {
  try {
    const { hardware, marca, modelo, preco, foto } = req.body;

    // Validações manuais prévias para mensagens amigáveis
    if (!hardware || typeof hardware !== 'string' || hardware.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'O campo hardware (nome/tipo) é obrigatório e deve ser um texto.' },
      });
    }

    if (!marca || typeof marca !== 'string' || marca.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'O campo marca é obrigatório e deve ser um texto.' },
      });
    }

    if (!modelo || typeof modelo !== 'string' || modelo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'O campo modelo é obrigatório e deve ser um texto.' },
      });
    }

    if (preco === undefined || preco === null || isNaN(Number(preco))) {
      return res.status(400).json({
        success: false,
        error: { message: 'O campo preco é obrigatório e deve ser um número válido.' },
      });
    }

    if (Number(preco) < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'O preço não pode ser negativo.' },
      });
    }

    const newItem = await Hardware.create({
      hardware: hardware.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      preco: Number(preco),
      foto: foto ? foto.trim() : '',
    });

    return res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/hardware/:id
 * Atualiza os dados de um aparelho existente.
 */
async function updateHardware(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `O ID informado ('${id}') não é um identificador válido do MongoDB.`,
        },
      });
    }

    const { hardware, marca, modelo, preco, foto } = req.body;

    const updateData = {};

    if (hardware !== undefined) {
      if (typeof hardware !== 'string' || hardware.trim() === '') {
        return res.status(400).json({
          success: false,
          error: { message: 'O campo hardware deve ser um texto válido não vazio.' },
        });
      }
      updateData.hardware = hardware.trim();
    }

    if (marca !== undefined) {
      if (typeof marca !== 'string' || marca.trim() === '') {
        return res.status(400).json({
          success: false,
          error: { message: 'O campo marca deve ser um texto válido não vazio.' },
        });
      }
      updateData.marca = marca.trim();
    }

    if (modelo !== undefined) {
      if (typeof modelo !== 'string' || modelo.trim() === '') {
        return res.status(400).json({
          success: false,
          error: { message: 'O campo modelo deve ser um texto válido não vazio.' },
        });
      }
      updateData.modelo = modelo.trim();
    }

    if (preco !== undefined) {
      if (isNaN(Number(preco))) {
        return res.status(400).json({
          success: false,
          error: { message: 'O campo preco deve ser um número válido.' },
        });
      }
      if (Number(preco) < 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'O preço não pode ser negativo.' },
        });
      }
      updateData.preco = Number(preco);
    }

    if (foto !== undefined) {
      updateData.foto = typeof foto === 'string' ? foto.trim() : '';
    }

    const updatedItem = await Hardware.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Aparelho de hardware não encontrado para atualização.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/hardware/:id
 * Exclui um aparelho existente pelo ID.
 */
async function deleteHardware(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `O ID informado ('${id}') não é um identificador válido do MongoDB.`,
        },
      });
    }

    const deletedItem = await Hardware.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Aparelho de hardware não encontrado para exclusão.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Aparelho excluído com sucesso.',
        id: deletedItem._id.toString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllHardware,
  getHardwareById,
  createHardware,
  updateHardware,
  deleteHardware,
};
