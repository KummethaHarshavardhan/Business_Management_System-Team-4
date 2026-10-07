import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewSale.css";
import { getCustomers } from "../../../services/customer";
import { getProducts } from "../../../services/product";
import { createSale } from "../../../services/sales";

// Existing product -> UI mapping (stock comes from Team 4 `stockQuantity`)
const mapProduct = (product) => ({
  id: product._id || product.id,
  name: product.productName || product.name,
  price: Number(product.sellingPrice ?? product.price ?? 0),
  stock: Number(product.stockQuantity ?? product.stock ?? 0),
});

function NewSale() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
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

        const formattedCustomers = customerData.map((customer) => ({
          id: customer._id || customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          gstNumber: customer.gstNumber,
        }));

        const formattedProducts = productData.map(mapProduct);

        setCustomers(formattedCustomers);
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const [discountType, setDiscountType] =
    useState("percentage");

  const [discountValue, setDiscountValue] =
    useState(0);

  const [taxRate, setTaxRate] = useState(0);

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: "",
      quantity: "",
      price: "",
    },
  ]);

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

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

  /* =========================================================
     SELECTED CUSTOMER
  ========================================================= */

  const selectedCustomer = customers.find(
    (customer) =>
      String(customer.id) === String(customerId)
  );

  /* =========================================================
     SUBTOTAL
  ========================================================= */

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        Number(item.quantity || 0) *
          Number(item.price || 0)
      );
    }, 0);
  }, [items]);

  /* =========================================================
     DISCOUNT
  ========================================================= */

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
  }, [
    subtotal,
    discountType,
    discountValue,
  ]);

  /* =========================================================
     TAXABLE AMOUNT
  ========================================================= */

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  /* =========================================================
     TAX
  ========================================================= */

  const taxAmount = useMemo(() => {
    const safeTaxRate = Math.max(
      0,
      Number(taxRate || 0)
    );

    return (
      (taxableAmount * safeTaxRate) / 100
    );
  }, [taxableAmount, taxRate]);

  /* =========================================================
     GRAND TOTAL
  ========================================================= */

  const grandTotal =
    taxableAmount + taxAmount;

  /* =========================================================
     ADD ITEM
  ========================================================= */

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now() + Math.random(),
        productId: "",
        quantity: "",
        price: "",
      },
    ]);
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

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

  const updateProduct = async (id, productId) => {
    // Fetch the latest stock from the database every time a product is selected
    let latestProducts = products;

    if (productId) {
      try {
        const productResponse = await getProducts();
        const productData = Array.isArray(productResponse)
          ? productResponse
          : productResponse.data || [];

        latestProducts = productData.map(mapProduct);
        setProducts(latestProducts);
      } catch (error) {
        console.error("Failed to refresh product stock:", error);
      }
    }

    const selectedProduct = latestProducts.find(
      (product) =>
        String(product.id) ===
        String(productId)
    );

    if (selectedProduct && selectedProduct.stock <= 0) {
      alert(`${selectedProduct.name} is Out of Stock.`);

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? { ...item, productId: "", price: 0, quantity: 1 }
            : item
        )
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              productId,
              price: selectedProduct
                ? selectedProduct.price
                : 0,
              quantity: Math.max(
                1,
                Number(item.quantity) || 1
              ),

            }
          : item
      )
    );
  };

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  const updateQuantity = (id, quantity) => {
    const currentItem = items.find(
      (item) => item.id === id
    );

    const selectedProduct = products.find(
      (product) =>
        String(product.id) ===
        String(currentItem?.productId)
    );

    if (quantity === "") {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: "",
              }
            : item
        )
      );

      return;
    }

    let newQuantity = Number(quantity);

    if (!Number.isFinite(newQuantity)) {
      return;
    }

    newQuantity = Math.max(
      1,
      Math.floor(newQuantity)
    );

    if (selectedProduct && newQuantity > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} units are available.`);
      newQuantity = selectedProduct.stock;
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

  /* =========================================================
     UPDATE PRICE
  ========================================================= */

  const updatePrice = (id, price) => {
    if (price === "") {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                price: "",
              }
            : item
        )
      );

      return;
    }

    let newPrice = Number(price);

    if (!Number.isFinite(newPrice)) {
      return;
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

  /* =========================================================
     DISCOUNT TYPE
  ========================================================= */

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    setDiscountValue(0);
  };

  /* =========================================================
     DISCOUNT VALUE
  ========================================================= */

  const handleDiscountValueChange = (value) => {
    if (value === "") {
      setDiscountValue(0);
      return;
    }

    let numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
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

  /* =========================================================
     TAX
  ========================================================= */

  const handleTaxChange = (value) => {
    if (value === "") {
      setTaxRate(0);
      return;
    }

    let numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    setTaxRate(
      Math.max(0, numericValue)
    );
  };

  const handleCreateSale = async () => {
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
      const overItem = items
        .map((item) => ({
          item,
          product: products.find(
            (p) => String(p.id) === String(item.productId)
          ),
        }))
        .find(
          ({ item, product }) =>
            product && item.quantity > product.stock
        );

      alert(
        overItem
          ? `Only ${overItem.product.stock} units are available for ${overItem.product.name}.`
          : "Please check the quantity and available stock."
      );
      return;
    }

    if (subtotal <= 0) {
      alert(
        "Please add at least one valid product."
      );
      return;
    }

    const saleData = {
      customer: customerId,

      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),

      discount: {
        type: discountType,
        value: discountValue,
      },

      taxRate,
      paymentMethod,
      paymentStatus,
    };

    try {
      await createSale(saleData);

      alert(
        `Sale created successfully!\n\nGrand Total: ${formatCurrency(
          grandTotal
        )}`
      );

      navigate("/sales");
    } catch (error) {
      console.error("Create Sale Error:", error);
      alert(error.message);
    }
  };

  /* =========================================================
     DISCOUNT SUMMARY LABEL
  ========================================================= */

  const discountSummaryLabel =
    discountType === "percentage"
      ? `Discount (${discountValue}%)`
      : `Discount (${formatCurrency(
          discountValue
        )})`;

  /* =========================================================
     RETURN UI
  ========================================================= */

  return (
    <div className="new-sale-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="sale-form-layout">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="sale-form-main">

          {/* =================================================
              CUSTOMER DETAILS
          ================================================= */}

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

          {/* =================================================
              SALE ITEMS
          ================================================= */}

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

                        {/* PRODUCT */}

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

                        {/* AVAILABLE */}

                        <td>
                          <span className="stock-badge">
                            {selectedProduct
                              ? `${selectedProduct.stock} available`
                              : "—"}
                          </span>
                        </td>

                        {/* QUANTITY */}

                        <td>
                          <input
                            type="number"
                            min="1"
                            max={
                              selectedProduct?.stock
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
                            disabled={
                              !selectedProduct ||
                              selectedProduct.stock <= 0
                            }

                          />
                        </td>

                        {/* PRICE */}

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
                              placeholder=""
                            />

                          </div>
                        </td>

                        {/* TOTAL */}

                        <td>
                          <strong>
                            {formatCurrency(
                              itemTotal
                            )}
                          </strong>
                        </td>

                        {/* REMOVE */}

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
                              items.length === 1
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

          {/* =================================================
              DISCOUNT & TAX
          ================================================= */}

          <div className="form-card discount-tax-card">

            <div className="card-title-row">

              <div className="card-title">
                <h2>Discount & Tax</h2>

                <p>
                  Apply discounts and taxes
                  to this sale.
                </p>
              </div>

            </div>

            <div className="form-grid-three">

              {/* DISCOUNT TYPE */}

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
                      "percentage"
                        ? 100
                        : undefined
                    }
                    value={
                      discountValue === 0
                        ? ""
                        : discountValue
                    }
                    onChange={(e) =>
                      handleDiscountValueChange(
                        e.target.value
                      )
                    }
                    placeholder=""
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

              {/* TAX RATE */}

              <div className="form-group">

                <label>
                  Tax Rate
                </label>

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="0"
                    value={
                      taxRate === 0
                        ? ""
                        : taxRate
                    }
                    onChange={(e) =>
                      handleTaxChange(
                        e.target.value
                      )
                    }
                    placeholder=""
                  />

                  <span>%</span>

                </div>

                <small>
                  Tax is calculated after
                  discount.
                </small>

              </div>

            </div>

          </div>

          {/* =================================================
              PAYMENT DETAILS
          ================================================= */}

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

                  <option value="BankTransfer">
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

        {/* ===================================================
            RIGHT SUMMARY
        =================================================== */}

        <aside className="sale-summary-panel">

          {/* SUMMARY HEADER */}

          <div className="summary-panel-header">

            <div>
              <h2>Sale Summary</h2>
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
                      Number(item.quantity || 0) *
                        Number(item.price || 0)
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

          {/* =================================================
              CALCULATIONS
          ================================================= */}

          <div className="summary-calculations">

            {/* SUBTOTAL */}

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

            {/* DISCOUNT */}

            <div>

              <span>
                {discountSummaryLabel}
              </span>

              <strong
                className={
                  discountAmount > 0
                    ? "discount-value"
                    : ""
                }
              >
                {discountAmount > 0
                  ? `-${formatCurrency(
                      discountAmount
                    )}`
                  : formatCurrency(0)}
              </strong>

            </div>

            {/* TAX */}

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

          {/* =================================================
              GRAND TOTAL
          ================================================= */}

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

          {/* =================================================
              PAYMENT
          ================================================= */}

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

          {/* =================================================
              ACTIONS
          ================================================= */}

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