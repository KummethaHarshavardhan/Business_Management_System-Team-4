import Counter from '../model/counter.js'

// Atomic increment, so two invoices at the same time never get the same number.
// Result: INV-0001, INV-0002, ...
export const generateInvoiceNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'invoice' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `INV-${String(counter.seq).padStart(4, '0')}`;
};
