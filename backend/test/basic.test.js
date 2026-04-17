const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({status: 'healthy'});
});

describe('Testes basicos da API', () =>{
    test('GET /health deve retornar healthy', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
    });

    test('API deve aceitar JSON', async () => {
        const response = await request(app)
            .post('/test')
            .send({test: 'data'});
        expect(response.status).toBe(404);
    });
});

