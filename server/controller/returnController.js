import mongoose from 'mongoose'
import Sale from '../model/sale.js'
import Return from '../model/return.js'
import { increaseStock } from '../services/stockService.js'

// POST /api/returns  body: { saleId, productId, quantityReturned, reason }
// Creates a return and puts the quantity back into stock.
export const createReturn = async (req, res) => {
  try {
    const { saleId, productId, quantityReturned, reason } = req.body;

    if (!mongoose.isValidObjectId(saleId) || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Valid saleId and productId are required' });
    }
    if (!Number.isInteger(quantityReturned) || quantityReturned < 1) {
      return res.status(400).json({ message: 'quantityReturned must be a whole number, minimum 1' });
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // The product must be part of this sale
    const soldItem = sale.items.find((item) => String(item.product) === String(productId));
    if (!soldItem) {
      return res.status(400).json({ message: 'This product is not part of the given sale' });
    }

    // Quantity already returned earlier (only Completed returns count)
    const previous = await Return.find({ sale: saleId, product: productId, status: 'Completed' });
    const alreadyReturned = previous.reduce((sum, r) => sum + r.quantityReturned, 0);
    const remaining = soldItem.quantity - alreadyReturned;

    if (quantityReturned > remaining) {
      return res.status(400).json({
        message: `Cannot return ${quantityReturned}. Only ${remaining} unit(s) can be returned.`,
      });
    }

    // -- i want api/data/field from team2 - api to INCREASE stock (used inside increaseStock in services/stockService.js)
    // Stock is increased BEFORE saving the return, so a failed stock update never leaves a saved return.
    await increaseStock(productId, quantityReturned);

    const newReturn = await Return.create({
      sale: saleId,
      product: productId,
      quantityReturned,
      reason,
    });

    return res.status(201).json(newReturn);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/returns?saleId=&productId=
// Lists returns, newest first.
export const getReturns = async (req, res) => {
  try {
    const { saleId, productId } = req.query;
    const filter = {};
    if (saleId) filter.sale = saleId;
    if (productId) filter.product = productId;

    const returns = await Return.find(filter).sort({ createdAt: -1 });
    return res.json(returns);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/returns/:id
// Gets one return by id.
export const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid return id' });
    }

    const found = await Return.findById(id);
    if (!found) {
      return res.status(404).json({ message: 'Return not found' });
    }
    return res.json(found);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
