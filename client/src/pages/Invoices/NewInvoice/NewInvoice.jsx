import { useEffect,useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Invoices.css';
import './NewInvoice.css';

import { getCustomers } from '../../../services/customer';
import { getProducts } from '../../../services/product';
import { createInvoice } from '../../../services/invoice';

function NewInvoice() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(18);

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: '',
      quantity: 1,
      price: 0,
    },
  ]);
    useEffect(() => {
      const fetchData = async () => {
        try {
          const customerResponse = await getCustomers();
          const productResponse = await getProducts();

          const customerData = Array.isArray(customerResponse)
            ? customerResponse
            : customerResponse.data || [];

          const productData = Array.isArray(productResponse)
            ? productResponse
            : productResponse.data || [];

          setCustomers(
            customerData.map((customer) => ({
              id: customer._id || customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              gstNumber: customer.gstNumber,
            }))
          );

          setProducts(
            productData.map((product) => ({
              id: product._id || product.id,
              name: product.productName || product.name,
              price:
                product.sellingPrice ??
                product.price ??
                0,
              stock:
                product.stockQuantity ??
                product.stock ??
                0,
            }))
          );
        } catch (error) {
          console.error(
            'Failed to fetch invoice data:',
            error
          );
        }
      };
      fetchData();
    }, []);


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
        quantity: 1,
        price: 0,
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
                : 0,
            }
          : item
      )
    );
  };

  const updateQuantity = (id, quantity) => {
    const numericQuantity = Number(quantity);

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                numericQuantity >= 1
                  ? numericQuantity
                  : 1,
            }
          : item
      )
    );
  };

  const updatePrice = (id, price) => {
    const numericPrice = Number(price);

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              price:
                numericPrice >= 0
                  ? numericPrice
                  : 0,
            }
          : item
      )
    );
  };

  const handleGenerateInvoice = async () => {
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

    if (subtotal <= 0) {
      alert(
        'Please add at least one product with a valid price.'
      );
      return;
    }

    const invoiceData = {
      customer: customerId,
      items: items.map((item) => ({
        product: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      discount: {
        type: discountType,
        value: Number(discountValue || 0),
      },
      taxRate: Number(taxRate || 0),
      paymentMethod,
      paymentStatus,
    };
    try {
      await createInvoice(invoiceData);
      alert('Invoice created successfully.');
      navigate('/invoices');
    } catch (error) {
      console.error('Invoice API Error:',error);
      alert(error.message);
    }
  };
  
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
                        />

                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            Number(item.quantity) *
                              Number(item.price)
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
            NOW COMES AFTER PAYMENT
            ON MOBILE
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
                      Number(item.quantity) *
                        Number(item.price)
                    )}
                  </strong>

                </div>
              );
            })}

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
                Discount
              </span>

              <strong className="discount-value">
                -{formatCurrency(discountAmount)}
              </strong>

            </div>

            <div>

              <span>
                Tax ({taxRate}%)
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
              BELOW SUMMARY
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