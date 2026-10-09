import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { createReturn, getReturns, getReturnById } from '../controller/returnController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createReturn);
router.get('/', getReturns);
router.get('/:id', getReturnById);

export default router;
