import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Invoices.css';
import './NewInvoice.css';

function NewInvoice() {
  const navigate = useNavigate();

  // Backend data will be populated here later.
  const products = [];
  const customers = [];

  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [taxRate, setTaxRate] = useState('');

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: '',
      quantity: '',
      price: '',
    },
  ]);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === String(customerId)
  );

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        Number(item.quantity || 0) *
          Number(item.price || 0)
      );
    }, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (
      discountValue === '' ||
      discountValue === null ||
      discountValue === undefined
    ) {
      return 0;
    }

    const value = Math.max(
      0,
      Number(discountValue || 0)
    );

    if (discountType === 'percentage') {
      const percentageDiscount =
        (subtotal * value) / 100;

      return Math.min(
        subtotal,
        percentageDiscount
      );
    }

    return Math.min(subtotal, value);
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  const taxAmount = useMemo(() => {
    if (
      taxRate === '' ||
      taxRate === null ||
      taxRate === undefined
    ) {
      return 0;
    }

    const rate = Math.max(
      0,
      Number(taxRate || 0)
    );

    return (taxableAmount * rate) / 100;
  }, [taxableAmount, taxRate]);

  const grandTotal = taxableAmount + taxAmount;

  const addItem = () => {
    setItems((previousItems) => [
      ...previousItems,
      {
        id: Date.now() + Math.random(),
        productId: '',
        quantity: '',
        price: '',
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) {
      return;
    }

    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };

  const updateProduct = (id, productId) => {
    const selectedProduct = products.find(
      (product) =>
        String(product.id) === String(productId)
    );

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              productId,
              price: selectedProduct
                ? selectedProduct.price
                : '',
            }
          : item
      )
    );
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === '') {
      setItems((previousItems) =>
        previousItems.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: '',
              }
            : item
        )
      );

      return;
    }

    const numericQuantity = Number(quantity);

    if (Number.isNaN(numericQuantity)) {
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                numericQuantity >= 1
                  ? numericQuantity
                  : '',
            }
          : item
      )
    );
  };

  const updatePrice = (id, price) => {
    if (price === '') {
      setItems((previousItems) =>
        previousItems.map((item) =>
          item.id === id
            ? {
                ...item,
                price: '',
              }
            : item
        )
      );

      return;
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              price:
                numericPrice >= 0
                  ? numericPrice
                  : '',
            }
          : item
      )
    );
  };

  const handleGenerateInvoice = () => {
    if (!customerId) {
      alert('Please select a customer.');
      return;
    }

    const hasInvalidProduct = items.some(
      (item) => !item.productId
    );

    if (hasInvalidProduct) {
      alert(
        'Please select a product for every invoice item.'
      );
      return;
    }

    const hasInvalidQuantity = items.some(
      (item) =>
        item.quantity === '' ||
        Number(item.quantity) <= 0
    );

    if (hasInvalidQuantity) {
      alert(
        'Please enter a valid quantity for every invoice item.'
      );
      return;
    }

    const hasInvalidPrice = items.some(
      (item) =>
        item.price === '' ||
        Number(item.price) < 0
    );

    if (hasInvalidPrice) {
      alert(
        'Please enter a valid price for every invoice item.'
      );
      return;
    }

    if (subtotal <= 0) {
      alert(
        'Please add at least one product with a valid price.'
      );
      return;
    }

    /*
      Backend integration will be added here.

      The backend should generate:
      - Invoice ID / Invoice Number
      - Invoice Date
      - Customer details
      - Product details
      - Invoice items
      - Subtotal
      - Discount
      - Tax
      - Grand Total
      - Payment Method
      - Payment Status

      Example API endpoint:
      POST /api/invoices
    */

    alert(
      'Invoice data is ready for backend integration.'
    );
  };

  const discountSummaryLabel =
    discountType === 'percentage'
      ? `Discount (${discountValue !== '' ? `${discountValue}%` : '—%'})`
      : 'Discount (₹)';

  const taxSummaryLabel =
    taxRate !== ''
      ? `Tax (${taxRate}%)`
      : 'Tax (—%)';

  return (
    <div className="new-invoice-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="new-invoice-header">

        <div>
          <h1>New Invoice</h1>

          <p>
            Create a new invoice for a customer.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate('/invoices')}
          type="button"
        >
          ← Back to Invoices
        </button>

      </div>

      {/* =========================
          MAIN LAYOUT
      ========================= */}

      <div className="invoice-form-layout">

        {/* =========================
            LEFT FORM SECTION
        ========================= */}

        <div className="invoice-form-main">

          {/* CUSTOMER DETAILS */}

          <div className="invoice-form-card">

            <div className="card-title">

              <div>

                <h2>Customer Details</h2>

                <p>
                  Select the customer for this invoice.
                </p>

              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Customer *
                </label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                >

                  <option value="">
                    Select Customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="customer-preview">

                <span>
                  Customer Phone
                </span>

                <strong>
                  {selectedCustomer
                    ? selectedCustomer.phone
                    : '—'}
                </strong>

              </div>

            </div>

          </div>

          {/* =========================
              INVOICE ITEMS
          ========================= */}

          <div className="invoice-form-card">

            <div className="card-header-row">

              <div>

                <h2>Invoice Items</h2>

                <p>
                  Add products and quantities.
                </p>

              </div>

              <button
                className="add-item-btn"
                onClick={addItem}
                type="button"
              >
                + Add Item
              </button>

            </div>

            <div className="items-table-wrapper">

              <table className="items-table">

                <thead>

                  <tr>
                    <th>PRODUCT</th>
                    <th>QUANTITY</th>
                    <th>PRICE</th>
                    <th>TOTAL</th>
                    <th></th>
                  </tr>

                </thead>

                <tbody>

                  {items.map((item) => (

                    <tr key={item.id}>

                      <td>

                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateProduct(
                              item.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Select Product
                          </option>

                          {products.map((product) => (

                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.name}
                            </option>

                          ))}

                        </select>

                      </td>

                      <td>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              e.target.value
                            )
                          }
                          placeholder=""
                        />

                      </td>

                      <td>

                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updatePrice(
                              item.id,
                              e.target.value
                            )
                          }
                          placeholder=""
                        />

                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            Number(item.quantity || 0) *
                              Number(item.price || 0)
                          )}
                        </strong>

                      </td>

                      <td>

                        <button
                          className="remove-item-btn"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          disabled={
                            items.length === 1
                          }
                          type="button"
                        >
                          ×
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* =========================
              DISCOUNT & TAX
          ========================= */}

          <div className="invoice-form-card">

            <div className="card-title">

              <div>

                <h2>Discount & Tax</h2>

                <p>
                  Apply discount and tax to the invoice.
                </p>

              </div>

            </div>

            <div className="form-grid-three">

              <div className="form-group">

                <label>
                  Discount Type
                </label>

                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(
                      e.target.value
                    )
                  }
                >

                  <option value="percentage">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed Amount
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Discount
                  {discountType === 'percentage'
                    ? ' (%)'
                    : ' (₹)'}
                </label>

                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(
                      e.target.value
                    )
                  }
                  placeholder=""
                />

              </div>

              <div className="form-group">

                <label>
                  Tax (%)
                </label>

                <input
                  type="number"
                  min="0"
                  value={taxRate}
                  onChange={(e) =>
                    setTaxRate(
                      e.target.value
                    )
                  }
                  placeholder=""
                />

              </div>

            </div>

          </div>

          {/* =========================
              PAYMENT DETAILS
          ========================= */}

          <div className="invoice-form-card">

            <div className="card-title">

              <div>

                <h2>Payment Details</h2>

                <p>
                  Select payment method and status.
                </p>

              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                >

                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Credit</option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Payment Status
                </label>

                <select
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value
                    )
                  }
                >

                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Partial</option>

                </select>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            INVOICE SUMMARY
        ========================= */}

        <div className="invoice-summary-panel">

          <div className="summary-panel-header">

            <h2>
              Invoice Summary
            </h2>

            <span>
              Preview
            </span>

          </div>

          <div className="summary-customer">

            <span>
              Bill To
            </span>

            <strong>
              {selectedCustomer
                ? selectedCustomer.name
                : 'No customer selected'}
            </strong>

            <p>
              {selectedCustomer
                ? selectedCustomer.phone
                : 'Select a customer'}
            </p>

          </div>

          <div className="summary-items">

            {items.map((item) => {

              const product = products.find(
                (productItem) =>
                  String(productItem.id) ===
                  String(item.productId)
              );

              if (!product) {
                return null;
              }

              return (
                <div
                  className="summary-item"
                  key={item.id}
                >

                  <div>

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {item.quantity} ×{' '}
                      {formatCurrency(item.price)}
                    </span>

                  </div>

                  <strong>
                    {formatCurrency(
                      Number(item.quantity || 0) *
                        Number(item.price || 0)
                    )}
                  </strong>

                </div>
              );
            })}

            {items.every(
              (item) => !item.productId
            ) && (
              <div className="summary-empty">
                No products added yet
              </div>
            )}

          </div>

          <div className="summary-calculations">

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                {formatCurrency(subtotal)}
              </strong>

            </div>

            <div>

              <span>
                {discountSummaryLabel}
              </span>

              <strong className="discount-value">
                -{formatCurrency(discountAmount)}
              </strong>

            </div>

            <div>

              <span>
                {taxSummaryLabel}
              </span>

              <strong>
                {formatCurrency(taxAmount)}
              </strong>

            </div>

          </div>

          <div className="summary-grand-total">

            <span>
              Grand Total
            </span>

            <strong>
              {formatCurrency(grandTotal)}
            </strong>

          </div>

          <div className="summary-payment">

            <div>

              <span>
                Payment Method
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>

            <div>

              <span>
                Status
              </span>

              <strong className="summary-status">
                {paymentStatus}
              </strong>

            </div>

          </div>

          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="invoice-actions">

            <button
              className="cancel-btn"
              onClick={() =>
                navigate('/invoices')
              }
              type="button"
            >
              Cancel
            </button>

            <button
              className="generate-btn"
              onClick={handleGenerateInvoice}
              type="button"
            >
              Generate Invoice
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default NewInvoice;