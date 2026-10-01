const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

describe('Testes da API REST - Mini Sistema de Gerenciamento de Hardware', () => {
  before(async () => {
    // Inicializa o servidor MongoDB em memória para testes isolados
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    // Carrega a aplicação após definir MONGODB_URI
    app = require('../src/app');

    // Conecta o Mongoose ao banco em memória
    await mongoose.connect(uri);
  });

  after(async () => {
    // Desconecta e encerra o servidor de teste
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Limpa a coleção antes de cada teste
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  // --- HEALTHCHECK & ROOT ---
  test('GET / deve retornar informações sobre a API', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.message.includes('API do Mini Sistema'));
  });

  test('GET /api/health deve retornar status saudável', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'healthy');
  });

  // --- POST /api/hardware ---
  test('POST /api/hardware deve cadastrar um aparelho válido', async () => {
    const novoAparelho = {
      hardware: 'Notebook Gamer',
      marca: 'Dell',
      modelo: 'G15',
      preco: 4500.5,
      foto: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
    };

    const res = await request(app)
      .post('/api/hardware')
      .send(novoAparelho)
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.hardware, 'Notebook Gamer');
    assert.equal(res.body.data.marca, 'Dell');
    assert.equal(res.body.data.modelo, 'G15');
    assert.equal(res.body.data.preco, 4500.5);
    assert.equal(res.body.data.foto, novoAparelho.foto);
    assert.ok(res.body.data.id, 'Deve conter o id formatado');
    assert.ok(res.body.data.createdAt, 'Deve conter createdAt');
    assert.ok(res.body.data.updatedAt, 'Deve conter updatedAt');
  });

  test('POST /api/hardware deve falhar ao enviar campos obrigatórios vazios', async () => {
    const res = await request(app)
      .post('/api/hardware')
      .send({
        hardware: '',
        marca: 'Dell',
        modelo: 'G15',
        preco: 4500,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('hardware'));
  });

  test('POST /api/hardware deve falhar com preço negativo', async () => {
    const res = await request(app)
      .post('/api/hardware')
      .send({
        hardware: 'Teclado Mecânico',
        marca: 'Logitech',
        modelo: 'G Pro',
        preco: -150,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('negativo'));
  });

  test('POST /api/hardware deve falhar com URL de foto inválida', async () => {
    const res = await request(app)
      .post('/api/hardware')
      .send({
        hardware: 'Monitor',
        marca: 'LG',
        modelo: 'UltraGear 27',
        preco: 1200,
        foto: 'imagem-sem-url-valida',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('URL válida'));
  });

  // --- GET /api/hardware ---
  test('GET /api/hardware deve listar aparelhos cadastrados ordenados por data decrescente', async () => {
    // Insere dois aparelhos
    await request(app).post('/api/hardware').send({
      hardware: 'Mouse',
      marca: 'Razer',
      modelo: 'DeathAdder',
      preco: 250,
    });

    await request(app).post('/api/hardware').send({
      hardware: 'Monitor',
      marca: 'Dell',
      modelo: 'UltraSharp',
      preco: 2800,
    });

    const res = await request(app).get('/api/hardware');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 2);
    // Mais recente primeiro
    assert.equal(res.body.data[0].hardware, 'Monitor');
    assert.equal(res.body.data[1].hardware, 'Mouse');
  });

  // --- GET /api/hardware/:id ---
  test('GET /api/hardware/:id deve retornar o aparelho correto por ID', async () => {
    const postRes = await request(app).post('/api/hardware').send({
      hardware: 'Placa de Vídeo',
      marca: 'Nvidia',
      modelo: 'RTX 4070',
      preco: 4200,
    });

    const id = postRes.body.data.id;

    const getRes = await request(app).get(`/api/hardware/${id}`);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.success, true);
    assert.equal(getRes.body.data.id, id);
    assert.equal(getRes.body.data.modelo, 'RTX 4070');
  });

  test('GET /api/hardware/:id deve retornar 400 para ID com formato inválido', async () => {
    const res = await request(app).get('/api/hardware/id-invalido-123');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('não é um identificador válido'));
  });

  test('GET /api/hardware/:id deve retornar 404 para ID inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/hardware/${fakeId}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('não encontrado'));
  });

  // --- PUT /api/hardware/:id ---
  test('PUT /api/hardware/:id deve atualizar dados de um aparelho existente', async () => {
    const postRes = await request(app).post('/api/hardware').send({
      hardware: 'SSD',
      marca: 'Kingston',
      modelo: 'NV2 1TB',
      preco: 350,
    });

    const id = postRes.body.data.id;

    const putRes = await request(app)
      .put(`/api/hardware/${id}`)
      .send({
        preco: 310,
        modelo: 'NV2 2TB',
      });

    assert.equal(putRes.status, 200);
    assert.equal(putRes.body.success, true);
    assert.equal(putRes.body.data.preco, 310);
    assert.equal(putRes.body.data.modelo, 'NV2 2TB');
    assert.equal(putRes.body.data.marca, 'Kingston'); // Preserva os campos não alterados
  });

  test('PUT /api/hardware/:id deve rejeitar preço negativo', async () => {
    const postRes = await request(app).post('/api/hardware').send({
      hardware: 'Headset',
      marca: 'HyperX',
      modelo: 'Cloud II',
      preco: 450,
    });

    const id = postRes.body.data.id;

    const putRes = await request(app)
      .put(`/api/hardware/${id}`)
      .send({
        preco: -50,
      });

    assert.equal(putRes.status, 400);
    assert.equal(putRes.body.success, false);
  });

  test('PUT /api/hardware/:id deve retornar 404 para ID inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/hardware/${fakeId}`)
      .send({ preco: 500 });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // --- DELETE /api/hardware/:id ---
  test('DELETE /api/hardware/:id deve remover um aparelho existente', async () => {
    const postRes = await request(app).post('/api/hardware').send({
      hardware: 'Fonte ATX',
      marca: 'Corsair',
      modelo: 'CV650',
      preco: 380,
    });

    const id = postRes.body.data.id;

    const delRes = await request(app).delete(`/api/hardware/${id}`);
    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.success, true);
    assert.equal(delRes.body.data.id, id);

    // Confirma que não existe mais no banco
    const getRes = await request(app).get(`/api/hardware/${id}`);
    assert.equal(getRes.status, 404);
  });

  test('DELETE /api/hardware/:id deve retornar 400 para ID inválido', async () => {
    const res = await request(app).delete('/api/hardware/123-abc');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('DELETE /api/hardware/:id deve retornar 404 para ID inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/hardware/${fakeId}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // --- ROTA INEXISTENTE (404) ---
  test('Requisição para rota desconhecida deve retornar 404 padronizado', async () => {
    const res = await request(app).get('/api/rota-que-nao-existe');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('Rota não encontrada'));
  });
});
