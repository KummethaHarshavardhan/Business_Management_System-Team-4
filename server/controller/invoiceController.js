import mongoose from 'mongoose'
import Sale from '../model/sale.js'
import Invoice from '../model/invoice.js'
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber.js'
import { round2 } from '../utils/calculateBill.js'
import { getProduct } from '../services/stockService.js'
import { getBusinessDetails } from '../services/businessService.js'

// POST /api/invoices  body: { saleId }
// Creates an invoice (snapshot) from an existing sale.
export const createInvoice = async (req, res) => {
  try {
    const { saleId } = req.body;

    if (!mongoose.isValidObjectId(saleId)) {
      return res.status(400).json({ message: 'Valid saleId is required' });
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // One invoice per sale
    const existing = await Invoice.findOne({ sale: saleId });
    if (existing) {
      return res.status(409).json({ message: 'Invoice already exists for this sale', invoice: existing });
    }

    // Team 1 data has arrived (GET /api/business). Forward the cashier's own
    // token so Team 1's authenticate middleware accepts the request.
    const businessDetails = await getBusinessDetails(req.headers.authorization);

    // -- i want api/data/field from team3 - customer by id (sale.customer): name, phone, address
    const customerDetails = {
      name: 'PENDING TEAM 3 DATA',
      phone: '',
      address: '',
    }; // temporary placeholder

    // Invoice items need productName from Team 2 (through stockService)
    const items = [];
    for (const item of sale.items) {
      // -- i want api/data/field from team2 - product name by id (used as invoice productName)
      const product = await getProduct(item.product);
      items.push({
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      });
    }

    const discountAmount =
      sale.discount?.type === 'percentage'
        ? round2((sale.subtotal * sale.discount.value) / 100)
        : sale.discount?.value || 0;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      sale: sale._id,
      businessDetails,
      customerDetails,
      items,
      subtotal: sale.subtotal,
      discountAmount,
      taxAmount: sale.tax,
      grandTotal: sale.grandTotal,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
    });

    return res.status(201).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/invoices?from=&to=&paymentStatus=
// Lists invoices, newest first. "to" date includes the whole day.
export const getInvoices = async (req, res) => {
  try {
    const { from, to, paymentStatus } = req.query;
    const filter = {};

    if (from || to) {
      filter.invoiceDate = {};

      if (from) {
        const start = new Date(from);
        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({ message: 'from is not a valid date' });
        }
        filter.invoiceDate.$gte = start;
      }

      if (to) {
        const end = new Date(to);
        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({ message: 'to is not a valid date' });
        }
        end.setHours(23, 59, 59, 999);
        filter.invoiceDate.$lte = end;
      }
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/invoices/:id
// Gets one invoice by id.
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid invoice id' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
