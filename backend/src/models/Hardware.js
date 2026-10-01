const mongoose = require('mongoose');

// Expressão regular para validação simples e robusta de URLs de imagens ou protocolos http/https
const urlRegex = /^(https?:\/\/|data:image\/|\/)[^\s]+$/i;

const HardwareSchema = new mongoose.Schema(
  {
    hardware: {
      type: String,
      required: [true, 'O campo hardware (nome/tipo) é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome do hardware deve ter pelo menos 2 caracteres.'],
      maxlength: [100, 'O nome do hardware não pode exceder 100 caracteres.'],
    },
    marca: {
      type: String,
      required: [true, 'O campo marca é obrigatório.'],
      trim: true,
      minlength: [2, 'A marca deve ter pelo menos 2 caracteres.'],
      maxlength: [100, 'A marca não pode exceder 100 caracteres.'],
    },
    modelo: {
      type: String,
      required: [true, 'O campo modelo é obrigatório.'],
      trim: true,
      minlength: [1, 'O modelo deve ter pelo menos 1 caractere.'],
      maxlength: [100, 'O modelo não pode exceder 100 caracteres.'],
    },
    preco: {
      type: Number,
      required: [true, 'O campo preco é obrigatório.'],
      min: [0, 'O preço não pode ser negativo.'],
    },
    foto: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (val) {
          if (!val || val.trim() === '') return true; // campo opcional
          return urlRegex.test(val);
        },
        message: 'A foto deve ser uma URL válida (iniciando com http://, https:// ou caminho relativo).',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Formatação ao converter para JSON para o cliente
HardwareSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.models.Hardware || mongoose.model('Hardware', HardwareSchema);
