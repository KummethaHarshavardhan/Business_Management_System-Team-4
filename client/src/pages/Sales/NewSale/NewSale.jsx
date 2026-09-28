import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewSale.css';

const products = [
  {
    id: 1,
    name: 'Wireless Keyboard',
    price: 1500,
    stock: 25,
  },
  {
    id: 2,
    name: 'USB Mouse',
    price: 800,
    stock: 40,
  },
  {
    id: 3,
    name: 'Monitor',
    price: 12500,
    stock: 10,
  },
  {
    id: 4,
    name: 'Laptop Stand',
    price: 2200,
    stock: 18,
  },
];

const customers = [
  {
    id: 1,
    name: 'Walk-in Customer',
    phone: '9876543210',
  },
  {
    id: 2,
    name: 'Rahul Kumar',
    phone: '9123456780',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    phone: '9988776655',
  },
];

function NewSale() {
  const navigate = useNavigate();

  /* =========================
     CUSTOMER & PAYMENT
  ========================= */

  const [customerId, setCustomerId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [paymentStatus, setPaymentStatus] = useState('Paid');

  /* =========================
     DISCOUNT & TAX
  ========================= */

  const [discountType, setDiscountType] =
    useState('percentage');

  const [discountValue, setDiscountValue] =
    useState(0);

  const [taxRate, setTaxRate] =
    useState(18);

  /* =========================
     SALE ITEMS
  ========================= */

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: '',
      quantity: 1,
      price: 0,
    },
  ]);

  /* =========================
     FORMAT CURRENCY
  ========================= */

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* =========================
     SELECTED CUSTOMER
  ========================= */

  const selectedCustomer = customers.find(
    (customer) =>
      String(customer.id) === String(customerId)
  );

  /* =========================
     SUBTOTAL
  ========================= */

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        Number(item.quantity || 0) *
          Number(item.price || 0)
      );
    }, 0);
  }, [items]);

  /* =========================
     DISCOUNT
  ========================= */

  const discountAmount = useMemo(() => {
    const value = Number(discountValue || 0);

    if (discountType === 'percentage') {
      return Math.min(
        subtotal,
        (subtotal * value) / 100
      );
    }

    return Math.min(subtotal, value);
  }, [
    subtotal,
    discountType,
    discountValue,
  ]);

  /* =========================
     TAXABLE AMOUNT
  ========================= */

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  /* =========================
     TAX
  ========================= */

  const taxAmount = useMemo(() => {
    return (
      (taxableAmount *
        Number(taxRate || 0)) /
      100
    );
  }, [taxableAmount, taxRate]);

  /* =========================
     GRAND TOTAL
  ========================= */

  const grandTotal =
    taxableAmount + taxAmount;

  /* =========================
     ADD ITEM
  ========================= */

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        productId: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (id) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter((item) => item.id !== id)
    );
  };

  /* =========================
     UPDATE PRODUCT
  ========================= */

  const updateProduct = (
    id,
    productId
  ) => {
    const selectedProduct =
      products.find(
        (product) =>
          String(product.id) ===
          String(productId)
      );

    setItems(
      items.map((item) =>
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

  /* =========================
     UPDATE QUANTITY
  ========================= */

  const updateQuantity = (
    id,
    quantity
  ) => {
    const currentItem = items.find(
      (item) => item.id === id
    );

    const selectedProduct =
      products.find(
        (product) =>
          String(product.id) ===
          String(currentItem?.productId)
      );

    let newQuantity =
      Number(quantity) || 1;

    newQuantity = Math.max(
      1,
      newQuantity
    );

    if (selectedProduct) {
      newQuantity = Math.min(
        selectedProduct.stock,
        newQuantity
      );
    }

    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  };

  /* =========================
     UPDATE PRICE
  ========================= */

  const updatePrice = (
    id,
    price
  ) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              price: Math.max(
                0,
                Number(price) || 0
              ),
            }
          : item
      )
    );
  };

  /* =========================
     GENERATE SALE
  ========================= */

  const handleCreateSale = () => {
    if (!customerId) {
      alert(
        'Please select a customer.'
      );
      return;
    }

    const hasInvalidProduct =
      items.some(
        (item) => !item.productId
      );

    if (hasInvalidProduct) {
      alert(
        'Please select a product for every sale item.'
      );
      return;
    }

    const hasInvalidQuantity =
      items.some((item) => {
        const product =
          products.find(
            (p) =>
              String(p.id) ===
              String(item.productId)
          );

        return (
          product &&
          item.quantity > product.stock
        );
      });

    if (hasInvalidQuantity) {
      alert(
        'One or more products exceed available stock.'
      );
      return;
    }

    alert(
      `Sale created successfully!\n\nGrand Total: ${formatCurrency(
        grandTotal
      )}`
    );

    navigate('/sales');
  };

  return (
    <div className="new-sale-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="new-sale-header">

        <div>
          <h1>New Sale</h1>

          <p>
            Create a new sales transaction
            for a customer.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() =>
            navigate('/sales')
          }
        >
          ← Back to Sales
        </button>

      </div>

      <div className="sale-form-layout">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="sale-form-main">

          {/* CUSTOMER DETAILS */}

          <div className="form-card">

            <div className="card-title">

              <div>
                <h2>
                  Customer Details
                </h2>

                <p>
                  Select the customer
                  for this sale.
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
                    setCustomerId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    )
                  )}

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
              SALE ITEMS
          ========================= */}

          <div className="form-card">

            <div className="card-header-row">

              <div>
                <h2>
                  Sale Items
                </h2>

                <p>
                  Add products and
                  quantities to the sale.
                </p>
              </div>

              <button
                className="add-item-btn"
                onClick={addItem}
              >
                + Add Item
              </button>

            </div>

            <div className="items-table-wrapper">

              <table className="items-table">

                <thead>
                  <tr>
                    <th>
                      PRODUCT
                    </th>

                    <th>
                      AVAILABLE
                    </th>

                    <th>
                      QUANTITY
                    </th>

                    <th>
                      PRICE
                    </th>

                    <th>
                      TOTAL
                    </th>

                    <th></th>
                  </tr>
                </thead>

                <tbody>

                  {items.map(
                    (item) => {

                      const selectedProduct =
                        products.find(
                          (product) =>
                            String(
                              product.id
                            ) ===
                            String(
                              item.productId
                            )
                        );

                      return (
                        <tr
                          key={item.id}
                        >

                          <td>

                            <select
                              value={
                                item.productId
                              }
                              onChange={(
                                e
                              ) =>
                                updateProduct(
                                  item.id,
                                  e.target.value
                                )
                              }
                            >

                              <option value="">
                                Select Product
                              </option>

                              {products.map(
                                (
                                  product
                                ) => (
                                  <option
                                    key={
                                      product.id
                                    }
                                    value={
                                      product.id
                                    }
                                  >
                                    {
                                      product.name
                                    }
                                  </option>
                                )
                              )}

                            </select>

                          </td>

                          <td>

                            <span className="stock-badge">

                              {selectedProduct
                                ? `${selectedProduct.stock} available`
                                : '—'}

                            </span>

                          </td>

                          <td>

                            <input
                              type="number"
                              min="1"
                              max={
                                selectedProduct
                                  ?.stock ||
                                undefined
                              }
                              value={
                                item.quantity
                              }
                              onChange={(
                                e
                              ) =>
                                updateQuantity(
                                  item.id,
                                  e.target.value
                                )
                              }
                            />

                          </td>

                          <td>

                            <div className="price-input">

                              <span>
                                ₹
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  item.price
                                }
                                onChange={(
                                  e
                                ) =>
                                  updatePrice(
                                    item.id,
                                    e.target.value
                                  )
                                }
                              />

                            </div>

                          </td>

                          <td>

                            <strong>
                              {formatCurrency(
                                Number(
                                  item.quantity ||
                                    0
                                ) *
                                  Number(
                                    item.price ||
                                      0
                                  )
                              )}
                            </strong>

                          </td>

                          <td>

                            <button
                              className="remove-item-btn"
                              onClick={() =>
                                removeItem(
                                  item.id
                                )
                              }
                              disabled={
                                items.length ===
                                1
                              }
                            >
                              ×
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =========================
              DISCOUNT & TAX
          ========================= */}

          <div className="form-card discount-tax-card">

            <div className="card-title">

              <div>
                <h2>
                  Discount & Tax
                </h2>

                <p>
                  Apply discounts and
                  taxes to this sale.
                </p>
              </div>

              <div className="section-badge">
                Pricing
              </div>

            </div>

            <div className="form-grid-three">

              {/* DISCOUNT TYPE */}

              <div className="form-group">

                <label>
                  Discount Type
                </label>

                <select
                  value={
                    discountType
                  }
                  onChange={(e) => {
                    setDiscountType(
                      e.target.value
                    );

                    setDiscountValue(
                      0
                    );
                  }}
                >

                  <option value="percentage">
                    Percentage (%)
                  </option>

                  <option value="fixed">
                    Fixed Amount (₹)
                  </option>

                </select>

                <small>
                  Choose how the
                  discount should
                  be applied.
                </small>

              </div>

              {/* DISCOUNT VALUE */}

              <div className="form-group">

                <label>
                  Discount Value
                </label>

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="0"
                    max={
                      discountType ===
                      'percentage'
                        ? 100
                        : undefined
                    }
                    value={
                      discountValue
                    }
                    onChange={(e) => {

                      const value =
                        Number(
                          e.target
                            .value
                        ) || 0;

                      if (
                        discountType ===
                        'percentage'
                      ) {

                        setDiscountValue(
                          Math.min(
                            100,
                            Math.max(
                              0,
                              value
                            )
                          )
                        );

                      } else {

                        setDiscountValue(
                          Math.max(
                            0,
                            value
                          )
                        );

                      }

                    }}
                    placeholder={
                      discountType ===
                      'percentage'
                        ? '0'
                        : '0.00'
                    }
                  />

                  <span>
                    {discountType ===
                    'percentage'
                      ? '%'
                      : '₹'}
                  </span>

                </div>

                <small>
                  {discountType ===
                  'percentage'
                    ? 'Maximum discount: 100%'
                    : 'Enter a fixed discount amount.'}
                </small>

              </div>

              {/* TAX */}

              <div className="form-group">

                <label>
                  Tax Rate
                </label>

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="0"
                    value={taxRate}
                    onChange={(e) =>
                      setTaxRate(
                        Math.max(
                          0,
                          Number(
                            e.target
                              .value
                          ) || 0
                        )
                      )
                    }
                    placeholder="18"
                  />

                  <span>
                    %
                  </span>

                </div>

                <small>
                  Tax will be
                  calculated after
                  discount.
                </small>

              </div>

            </div>

            {/* DISCOUNT PREVIEW */}

            <div className="discount-preview">

              <div className="preview-item">

                <span>
                  Discount Applied
                </span>

                <strong>
                  {discountType ===
                  'percentage'
                    ? `${discountValue}%`
                    : `₹${Number(
                        discountValue ||
                          0
                      ).toFixed(2)}`}
                </strong>

              </div>

              <div className="preview-divider"></div>

              <div className="preview-item">

                <span>
                  Tax Rate
                </span>

                <strong>
                  {Number(
                    taxRate || 0
                  )}
                  %
                </strong>

              </div>

            </div>

          </div>

          {/* =========================
              PAYMENT DETAILS
          ========================= */}

          <div className="form-card">

            <div className="card-title">

              <div>
                <h2>
                  Payment Details
                </h2>

                <p>
                  Select payment method
                  and status.
                </p>
              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Payment Method
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                >

                  <option>
                    Cash
                  </option>

                  <option>
                    UPI
                  </option>

                  <option>
                    Card
                  </option>

                  <option>
                    Bank Transfer
                  </option>

                  <option>
                    Credit
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Payment Status
                </label>

                <select
                  value={
                    paymentStatus
                  }
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value
                    )
                  }
                >

                  <option>
                    Paid
                  </option>

                  <option>
                    Pending
                  </option>

                  <option>
                    Partial
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =========================
              ACTIONS
          ========================= */}

          <div className="sale-actions">

            <button
              className="cancel-btn"
              onClick={() =>
                navigate('/sales')
              }
            >
              Cancel
            </button>

            <button
              className="generate-btn"
              onClick={
                handleCreateSale
              }
            >
              Create Sale
            </button>

          </div>

        </div>

        {/* =========================
            RIGHT SUMMARY
        ========================= */}

        <div className="sale-summary-panel">

          <div className="summary-panel-header">

            <div>
              <h2>
                Sale Summary
              </h2>

              <span>
                SALE-0004
              </span>
            </div>

          </div>

          {/* CUSTOMER */}

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

          {/* ITEMS */}

          <div className="summary-items">

            {items.map((item) => {

              const product =
                products.find(
                  (p) =>
                    String(p.id) ===
                    String(
                      item.productId
                    )
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
                      {formatCurrency(
                        item.price
                      )}
                    </span>

                  </div>

                  <strong>
                    {formatCurrency(
                      item.quantity *
                        item.price
                    )}
                  </strong>

                </div>
              );
            })}

            {items.every(
              (item) =>
                !item.productId
            ) && (
              <div className="summary-empty">
                <span>
                  No products added yet
                </span>
              </div>
            )}

          </div>

          {/* CALCULATIONS */}

          <div className="summary-calculations">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>
            </div>

            <div>
              <span>
                Discount
              </span>

              <strong className="discount-value">
                -{formatCurrency(
                  discountAmount
                )}
              </strong>
            </div>

            <div>
              <span>
                Tax ({taxRate}%)
              </span>

              <strong>
                {formatCurrency(
                  taxAmount
                )}
              </strong>
            </div>

          </div>

          {/* GRAND TOTAL */}

          <div className="summary-grand-total">

            <span>
              Grand Total
            </span>

            <strong>
              {formatCurrency(
                grandTotal
              )}
            </strong>

          </div>

          {/* PAYMENT */}

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
                Payment Status
              </span>

              <strong className="summary-status">
                {paymentStatus}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default NewSale;