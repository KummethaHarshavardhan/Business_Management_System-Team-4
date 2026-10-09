import express from 'express';
import { createInvoice, getInvoices, getInvoiceById, updateInvoicePaymentStatus } from '../controller/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.patch('/:id/payment-status', updateInvoicePaymentStatus);
router.get('/:id', getInvoiceById);

export default router;
