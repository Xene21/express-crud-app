const request = require('supertest');
const app = require('./app');

describe('Products API', () => {
    describe('GET /products', () => {
        it('Should return a list of Products paginated', async () => {
            const res = await request(app)
            .get('/products?page=1&limit=3')
            .expect('Content-Type', /json/)
            .expect(200);

            expect(res.body).toHaveProperty('limit', 3);
            expect(res.body).toHaveProperty('products');
            expect(res.body).toBeInstanceOf(Object);

        })

        it('Should return a single product by ID', async () => {
            const res = await request(app)
            .get('/products/1')
            .expect('Content-Type', /json/)
            .expect(200);

            expect(res.body).toHaveProperty('id', 1);
            expect(res.body).toHaveProperty('price');
        })
    })
    describe('Post /products', () => {
        it('Should sum two numbers', async () => {
            const res = await request(app)
            .post('/api/calculate')
            .send({num1: 5, num2: 10})
            .expect('Content-Type', /json/)
            .expect(201);

            expect(res.body).toHaveProperty('sum');
        })
    })
    describe('PUT /products/:productId', () => {
        it('Should update a product', async () => {
            const res = await request(app)
            .put('/products/7')
            .send({id: 7, name: 'USB', price: 10 })
            .expect('Content-Type', /json/)
            .expect(200);
            expect(res.body).toHaveProperty('id', 7);
            expect(res.body).toHaveProperty('name', 'USB');
            expect(res.body).toHaveProperty('price', 10);
        })
        it('should return 404 if product not found', async () => {
            const res = await request(app)
            .put('/products/999')
            .expect('Content-Type', /json/)
            .expect(404);

            expect(res.body).toHaveProperty('error','Product not found');
    })
    describe('Delete /products/:productId', () => {
        it('Should delete a product', async () => {
            const res = await request(app)
            .delete('/products/4')
            .expect('Content-Type', /json/)
            .expect(200);

            expect(res.body).toHaveProperty('message', 'Product deleted successfully');
        }) 
    })
})
})