import express from 'express'
import verifyToken from '../middleware/verifyToken.js'
import validateSale from '../middleware/validateSale.js'
import checkStock from '../middleware/checkStock.js'
import { createSale, getSales, getSaleById } from '../controller/saleController.js'

const router = express.Router();


router.use(verifyToken);

router.post('/', validateSale, checkStock, createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);

export default router;