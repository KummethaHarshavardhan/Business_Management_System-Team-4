import express from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { getAllCustomers } from '../services/customerService.js'
import { getAllProducts } from '../services/stockService.js'

const router = express.Router();

router.get('/test-customers', verifyToken, async (req, res) => {
  try {
    const customers = await getAllCustomers();
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/test-products', verifyToken, async (req, res) => {
  try {
    const products = await getAllProducts();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
