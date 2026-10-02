import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewSale.css";

const products = [
  {
    id: 1,
    name: "Wireless Keyboard",
    price: 1500,
    stock: 25,
  },
  {
    id: 2,
    name: "USB Mouse",
    price: 800,
    stock: 40,
  },
  {
    id: 3,
    name: "Monitor",
    price: 12500,
    stock: 10,
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 2200,
    stock: 18,
  },
];

const customers = [
  {
    id: 1,
    name: "Walk-in Customer",
    phone: "9876543210",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    phone: "9123456780",
  },
  {
    id: 3,
    name: "Priya Sharma",
    phone: "9988776655",
  },
];

function NewSale() {
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const [discountType, setDiscountType] =
    useState("percentage");

  const [discountValue, setDiscountValue] =
    useState(0);

  const [taxRate, setTaxRate] = useState(18);

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const formatCurrency = (amount) => {
    const safeAmount = Number(amount);

    if (!Number.isFinite(safeAmount)) {
      return "₹0.00";
    }

    return `₹${safeAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const selectedCustomer = customers.find(
    (customer) =>
      String(customer.id) === String(customerId)
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
    const value = Number(discountValue || 0);

    if (discountType === "percentage") {
      return Math.min(
        subtotal,
        (subtotal *
          Math.min(100, Math.max(0, value))) /
          100
      );
    }

    return Math.min(
      subtotal,
      Math.max(0, value)
    );
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  const taxAmount = useMemo(() => {
    const safeTaxRate = Math.max(
      0,
      Number(taxRate || 0)
    );

    return (
      (taxableAmount * safeTaxRate) / 100
    );
  }, [taxableAmount, taxRate]);

  const grandTotal =
    taxableAmount + taxAmount;

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now() + Math.random(),
        productId: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };

  const updateProduct = (id, productId) => {
    const selectedProduct = products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              productId,
              price: selectedProduct
                ? selectedProduct.price
                : 0,
              quantity: selectedProduct
                ? Math.min(
                    Math.max(
                      1,
                      Number(item.quantity) || 1
                    ),
                    selectedProduct.stock
                  )
                : 1,
            }
          : item
      )
    );
  };

  const updateQuantity = (id, quantity) => {
    const currentItem = items.find(
      (item) => item.id === id
    );

    const selectedProduct = products.find(
      (product) =>
        String(product.id) ===
        String(currentItem?.productId)
    );

    let newQuantity = Number(quantity);

    if (!Number.isFinite(newQuantity)) {
      newQuantity = 1;
    }

    newQuantity = Math.max(
      1,
      Math.floor(newQuantity)
    );

    if (selectedProduct) {
      newQuantity = Math.min(
        selectedProduct.stock,
        newQuantity
      );
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  };

  const updatePrice = (id, price) => {
    let newPrice = Number(price);

    if (!Number.isFinite(newPrice)) {
      newPrice = 0;
    }

    newPrice = Math.max(0, newPrice);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              price: newPrice,
            }
          : item
      )
    );
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    setDiscountValue(0);
  };

  const handleDiscountValueChange = (value) => {
    let numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      numericValue = 0;
    }

    numericValue = Math.max(
      0,
      numericValue
    );

    if (discountType === "percentage") {
      numericValue = Math.min(
        100,
        numericValue
      );
    }

    setDiscountValue(numericValue);
  };

  const handleTaxChange = (value) => {
    let numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      numericValue = 0;
    }

    setTaxRate(
      Math.max(0, numericValue)
    );
  };

  const handleCreateSale = () => {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    const hasInvalidProduct = items.some(
      (item) => !item.productId
    );

    if (hasInvalidProduct) {
      alert(
        "Please select a product for every sale item."
      );
      return;
    }

    const hasInvalidQuantity = items.some(
      (item) => {
        const product = products.find(
          (p) =>
            String(p.id) ===
            String(item.productId)
        );

        return (
          !product ||
          item.quantity < 1 ||
          item.quantity > product.stock
        );
      }
    );

    if (hasInvalidQuantity) {
      alert(
        "Please check the quantity and available stock."
      );
      return;
    }

    if (subtotal <= 0) {
      alert(
        "Please add at least one valid product."
      );
      return;
    }

    alert(
      `Sale created successfully!\n\nGrand Total: ${formatCurrency(
        grandTotal
      )}`
    );

    navigate("/sales");
  };

  return (
    <div className="new-sale-page">

      {/* PAGE HEADER */}

      <div className="new-sale-header">
        <div>
          <h1>New Sale</h1>

          <p>
            Create a new sales transaction
            for a customer.
          </p>
        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/sales")}
        >
          ← Back to Sales
        </button>
      </div>

      {/* MAIN LAYOUT */}

      <div className="sale-form-layout">

        {/* LEFT SIDE */}

        <div className="sale-form-main">

          {/* CUSTOMER DETAILS */}

          <div className="form-card">
            <div className="card-title">
              <h2>Customer Details</h2>

              <p>
                Select the customer for this sale.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Customer <span>*</span>
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
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* SALE ITEMS */}

          <div className="form-card">

            <div className="card-header-row">
              <div>
                <h2>Sale Items</h2>

                <p>
                  Add products and quantities
                  to the sale.
                </p>
              </div>

              <button
                type="button"
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
                    <th>PRODUCT</th>
                    <th>AVAILABLE</th>
                    <th>QUANTITY</th>
                    <th>PRICE</th>
                    <th>TOTAL</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const selectedProduct =
                      products.find(
                        (product) =>
                          String(product.id) ===
                          String(
                            item.productId
                          )
                      );

                    const itemTotal =
                      Number(
                        item.quantity || 0
                      ) *
                      Number(
                        item.price || 0
                      );

                    return (
                      <tr key={item.id}>

                        <td>
                          <select
                            value={
                              item.productId
                            }
                            onChange={(e) =>
                              updateProduct(
                                item.id,
                                e.target.value
                              )
                            }
                            aria-label="Select product"
                          >
                            <option value="">
                              Select Product
                            </option>

                            {products.map(
                              (product) => (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                >
                                  {product.name}
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td>
                          <span className="stock-badge">
                            {selectedProduct
                              ? `${selectedProduct.stock} available`
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            max={
                              selectedProduct
                                ?.stock
                            }
                            value={
                              item.quantity
                            }
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                e.target.value
                              )
                            }
                            aria-label="Quantity"
                          />
                        </td>

                        <td>
                          <div className="price-input">
                            <span>₹</span>

                            <input
                              type="number"
                              min="0"
                              value={
                                item.price
                              }
                              onChange={(e) =>
                                updatePrice(
                                  item.id,
                                  e.target.value
                                )
                              }
                              aria-label="Price"
                            />
                          </div>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              itemTotal
                            )}
                          </strong>
                        </td>

                        <td>
                          <button
                            type="button"
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
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DISCOUNT & TAX */}

          <div className="form-card discount-tax-card">

            <div className="card-title-row">
              <div className="card-title">
                <h2>Discount & Tax</h2>

                <p>
                  Apply discounts and taxes
                  to this sale.
                </p>
              </div>

              <div className="section-badge">
                Pricing
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
                    handleDiscountTypeChange(
                      e.target.value
                    )
                  }
                >
                  <option value="percentage">
                    Percentage (%)
                  </option>

                  <option value="fixed">
                    Fixed Amount (₹)
                  </option>
                </select>

                <small>
                  Choose how the discount
                  should be applied.
                </small>
              </div>

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
                      "percentage"
                        ? 100
                        : undefined
                    }
                    value={discountValue}
                    onChange={(e) =>
                      handleDiscountValueChange(
                        e.target.value
                      )
                    }
                  />

                  <span>
                    {discountType ===
                    "percentage"
                      ? "%"
                      : "₹"}
                  </span>
                </div>

                <small>
                  {discountType ===
                  "percentage"
                    ? "Maximum discount: 100%"
                    : "Maximum discount cannot exceed subtotal."}
                </small>
              </div>

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
                      handleTaxChange(
                        e.target.value
                      )
                    }
                  />

                  <span>%</span>
                </div>

                <small>
                  Tax is calculated after
                  discount.
                </small>
              </div>
            </div>

            <div className="discount-preview">

              <div className="preview-item">
                <span>
                  Discount Applied
                </span>

                <strong>
                  {discountType ===
                  "percentage"
                    ? `${discountValue}%`
                    : formatCurrency(
                        discountAmount
                      )}
                </strong>
              </div>

              <div className="preview-divider" />

              <div className="preview-item">
                <span>
                  Tax Rate
                </span>

                <strong>
                  {taxRate}%
                </strong>
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}

          <div className="form-card">

            <div className="card-title">
              <h2>Payment Details</h2>

              <p>
                Select payment method and
                status.
              </p>
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
                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Credit">
                    Credit
                  </option>
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
                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Partial">
                    Partial
                  </option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SUMMARY */}

        <aside className="sale-summary-panel">

          <div className="summary-panel-header">
            <div>
              <h2>Sale Summary</h2>

              <span>SALE-0004</span>
            </div>
          </div>

          {/* CUSTOMER */}

          <div className="summary-customer">
            <span>Bill To</span>

            <strong>
              {selectedCustomer
                ? selectedCustomer.name
                : "No customer selected"}
            </strong>

            <p>
              {selectedCustomer
                ? selectedCustomer.phone
                : "Select a customer"}
            </p>
          </div>

          {/* ITEMS */}

          <div className="summary-items">

            {items.map((item) => {
              const product =
                products.find(
                  (p) =>
                    String(p.id) ===
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
                      {item.quantity} ×{" "}
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
              <span>Subtotal</span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>
            </div>

            <div>
              <span>Discount</span>

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

            <span>Grand Total</span>

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

              <strong
                className={`summary-status ${paymentStatus
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {paymentStatus}
              </strong>
            </div>
          </div>

          {/* ACTIONS
              MOVED INSIDE SUMMARY PANEL
              SO THEY ALWAYS APPEAR BELOW
              SALE SUMMARY
          */}

          <div className="sale-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/sales")
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="generate-btn"
              onClick={handleCreateSale}
            >
              Create Sale
            </button>

          </div>

        </aside>
      </div>
    </div>
  );
}

export default NewSale;