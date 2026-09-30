import { jest } from '@jest/globals'
import express from 'express'
import request from 'supertest'

// ---- Mocks: no real database, no real Team 2 api is used ----
const mockSale = { findById: jest.fn() };
const mockReturn = { find: jest.fn(), create: jest.fn(), findById: jest.fn() };
const mockIncreaseStock = jest.fn();

jest.unstable_mockModule('../model/sale.js', () => ({ default: mockSale }));
jest.unstable_mockModule('../model/return.js', () => ({ default: mockReturn }));
jest.unstable_mockModule('../services/stockService.js', () => ({
  getProduct: jest.fn(),
  increaseStock: mockIncreaseStock,
  decreaseStock: jest.fn(),
}));

// routes must be imported AFTER the mocks are registered
const { default: returnRoutes } = await import('../routes/returnRoutes.js');

// small app with only the return routes (server.js starts a real server, so tests do not import it)
const app = express();
app.use(express.json());
app.use('/api/returns', returnRoutes);

const SALE_ID = '665f1a2b3c4d5e6f7a8b9c0d';
const PRODUCT_ID = '665f1a2b3c4d5e6f7a8b9c0e';
const OTHER_PRODUCT_ID = '665f1a2b3c4d5e6f7a8b9c11';
const RETURN_ID = '665f1a2b3c4d5e6f7a8b9c12';

// sold quantity is 5
const sale = {
  _id: SALE_ID,
  items: [{ product: PRODUCT_ID, quantity: 5, price: 100, total: 500 }],
};

const validBody = { saleId: SALE_ID, productId: PRODUCT_ID, quantityReturned: 2, reason: 'Damaged' };

beforeEach(() => {
  jest.resetAllMocks();
  mockSale.findById.mockResolvedValue(sale);
  mockReturn.find.mockResolvedValue([]); // nothing returned earlier
  mockIncreaseStock.mockResolvedValue(true);
  mockReturn.create.mockImplementation(async (doc) => ({ _id: RETURN_ID, ...doc }));
});

describe('POST /api/returns', () => {
  test('creates a return and increases stock', async () => {
    const res = await request(app).post('/api/returns').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.quantityReturned).toBe(2);
    expect(res.body.reason).toBe('Damaged');
    expect(mockIncreaseStock).toHaveBeenCalledWith(PRODUCT_ID, 2);
    expect(mockReturn.create).toHaveBeenCalledWith({
      sale: SALE_ID,
      product: PRODUCT_ID,
      quantityReturned: 2,
      reason: 'Damaged',
    });
  });

  test('stock is increased BEFORE the return is saved', async () => {
    await request(app).post('/api/returns').send(validBody);

    const stockOrder = mockIncreaseStock.mock.invocationCallOrder[0];
    const saveOrder = mockReturn.create.mock.invocationCallOrder[0];
    expect(stockOrder).toBeLessThan(saveOrder);
  });

  test('only Completed returns are counted as already returned', async () => {
    await request(app).post('/api/returns').send(validBody);

    expect(mockReturn.find).toHaveBeenCalledWith({
      sale: SALE_ID,
      product: PRODUCT_ID,
      status: 'Completed',
    });
  });

  test('allows returning exactly the remaining quantity', async () => {
    mockReturn.find.mockResolvedValue([{ quantityReturned: 3 }]); // 3 of 5 already returned

    const res = await request(app).post('/api/returns').send({ ...validBody, quantityReturned: 2 });

    expect(res.status).toBe(201);
  });

  test('400 when quantity is more than what was sold', async () => {
    const res = await request(app).post('/api/returns').send({ ...validBody, quantityReturned: 10 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only 5 unit/);
    expect(mockIncreaseStock).not.toHaveBeenCalled();
    expect(mockReturn.create).not.toHaveBeenCalled();
  });

  test('400 when quantity is more than what is still returnable', async () => {
    mockReturn.find.mockResolvedValue([{ quantityReturned: 4 }]); // only 1 left

    const res = await request(app).post('/api/returns').send({ ...validBody, quantityReturned: 2 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only 1 unit/);
    expect(mockReturn.create).not.toHaveBeenCalled();
  });

  test('400 when the product is not part of the sale', async () => {
    const res = await request(app).post('/api/returns').send({ ...validBody, productId: OTHER_PRODUCT_ID });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not part of/);
    expect(mockIncreaseStock).not.toHaveBeenCalled();
  });

  test('404 when the sale does not exist', async () => {
    mockSale.findById.mockResolvedValue(null);

    const res = await request(app).post('/api/returns').send(validBody);

    expect(res.status).toBe(404);
    expect(mockReturn.create).not.toHaveBeenCalled();
  });

  test('400 when saleId or productId is not a valid ObjectId', async () => {
    const res1 = await request(app).post('/api/returns').send({ ...validBody, saleId: 'abc' });
    const res2 = await request(app).post('/api/returns').send({ ...validBody, productId: 'xyz' });

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
  });

  test.each([0, -1, 1.5, '2', null])('400 when quantityReturned is %p', async (qty) => {
    const res = await request(app).post('/api/returns').send({ ...validBody, quantityReturned: qty });

    expect(res.status).toBe(400);
    expect(mockReturn.create).not.toHaveBeenCalled();
  });

  test('400 when required fields are missing', async () => {
    const res = await request(app).post('/api/returns').send({ saleId: SALE_ID });
    expect(res.status).toBe(400);
  });

  test('500 and NO return saved when the stock update fails', async () => {
    mockIncreaseStock.mockRejectedValue(new Error('Team 2 stock update failed'));

    const res = await request(app).post('/api/returns').send(validBody);

    expect(res.status).toBe(500);
    expect(mockReturn.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/returns', () => {
  test('lists returns, newest first', async () => {
    const sort = jest.fn().mockResolvedValue([{ _id: RETURN_ID }]);
    mockReturn.find.mockReturnValue({ sort });

    const res = await request(app).get('/api/returns');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test('filters by saleId and productId', async () => {
    mockReturn.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await request(app).get(`/api/returns?saleId=${SALE_ID}&productId=${PRODUCT_ID}`);

    expect(mockReturn.find).toHaveBeenCalledWith({ sale: SALE_ID, product: PRODUCT_ID });
  });

  test('400 for an invalid saleId, does not touch the database', async () => {
    const res = await request(app).get('/api/returns?saleId=invalid123');

    expect(res.status).toBe(400);
    expect(mockReturn.find).not.toHaveBeenCalled();
  });

  test('400 for an invalid productId, does not touch the database', async () => {
    const res = await request(app).get('/api/returns?productId=invalid123');

    expect(res.status).toBe(400);
    expect(mockReturn.find).not.toHaveBeenCalled();
  });
});

describe('GET /api/returns/:id', () => {
  test('returns one return', async () => {
    mockReturn.findById.mockResolvedValue({ _id: RETURN_ID, quantityReturned: 2 });

    const res = await request(app).get(`/api/returns/${RETURN_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.quantityReturned).toBe(2);
  });

  test('400 for an invalid id', async () => {
    const res = await request(app).get('/api/returns/abc');
    expect(res.status).toBe(400);
  });

  test('404 when not found', async () => {
    mockReturn.findById.mockResolvedValue(null);

    const res = await request(app).get(`/api/returns/${RETURN_ID}`);

    expect(res.status).toBe(404);
  });
});
