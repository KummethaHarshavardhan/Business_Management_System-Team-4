import mongoose from 'mongoose'
import Sale from '../model/sale.js'
import { calculateBill } from '../utils/calculateBill.js'
import { decreaseStock, increaseStock } from '../services/stockService.js'
import { getCustomer } from '../services/customerService.js'

const rollbackStock = async (decreasedItems, token) => {
    for (const item of decreasedItems) {
        try {
            await increaseStock(item.product, item.quantity, token);
        } catch (error) {
            console.error(`Stock rollback failed for product ${item.product}:`, error.message);
        }
    }
};

export const createSale = async (req, res) => {
    const decreased = [];

    try {
        const { customer, items, discount, taxRate, paymentMethod, paymentStatus } = req.body;

        try {
            await getCustomer(customer, req.headers.authorization);
        } catch (error) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const billItems = items.map((item) => {
            const product = req.products[item.product];
            const price = typeof item.price === 'number' ? item.price : product.price;
            return { product: item.product, quantity: item.quantity, price };
        });

        let bill;
        try {
            bill = calculateBill({ items: billItems, discount, taxRate });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const saleData = {
            customer,
            items: bill.items.map(({ product, quantity, price, total }) => ({ product, quantity, price, total })),
            subtotal: bill.subtotal,
            discount: { type: discount?.type || 'fixed', value: discount?.value || 0 },
            tax: bill.taxAmount,
            grandTotal: bill.grandTotal,
            paymentMethod,
            paymentStatus,
            createdBy: req.user?._id,
        };

        for (const item of bill.items) {
            await decreaseStock(item.product, item.quantity, req.headers.authorization);//here after check apis remove req.headers now i keep for this testing apis
            decreased.push(item);
        }

        const sale = await Sale.create(saleData);
        return res.status(201).json(sale);
    } catch (error) {
        await rollbackStock(decreased, req.headers.authorization);
        return res.status(500).json({ message: error.message });
    }
};

export const getSales = async (req, res) => {
    try {
        const { from, to, customer } = req.query;
        const filter = {};

        if (from || to) {
            filter.createdAt = {};

            if (from) {
                const start = new Date(from);
                if (Number.isNaN(start.getTime())) {
                    return res.status(400).json({ message: 'from is not a valid date' });
                }
                filter.createdAt.$gte = start;
            }

            if (to) {
                const end = new Date(to);
                if (Number.isNaN(end.getTime())) {
                    return res.status(400).json({ message: 'to is not a valid date' });
                }
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        if (customer) {
            if (!mongoose.isValidObjectId(customer)) {
                return res.status(400).json({ message: 'customer is not a valid id' });
            }
            filter.customer = customer;
        }

        const sales = await Sale.find(filter).sort({ createdAt: -1 });
        return res.json(sales);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid sale id' });
        }

        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        return res.json(sale);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
