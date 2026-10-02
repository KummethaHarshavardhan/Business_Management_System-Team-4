import { useMemo, useState } from "react";
import "./Billing.css";

const demoCustomers = [
  {
    id: "CUST001",
    name: "Rahul Kumar",
    phone: "9876543210",
  },
  {
    id: "CUST002",
    name: "Priya Sharma",
    phone: "9123456780",
  },
  {
    id: "CUST003",
    name: "Arjun Reddy",
    phone: "9988776655",
  },
];

const demoProducts = [
  {
    id: "PROD001",
    name: "Laptop",
    price: 55000,
    stock: 8,
  },
  {
    id: "PROD002",
    name: "Wireless Mouse",
    price: 850,
    stock: 25,
  },
  {
    id: "PROD003",
    name: "Keyboard",
    price: 1500,
    stock: 15,
  },
  {
    id: "PROD004",
    name: "Monitor",
    price: 12000,
    stock: 10,
  },
];

function Billing() {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState([]);

  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  const [tax, setTax] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const selectedProduct = demoProducts.find(
    (product) => product.id === productId
  );

  const selectedCustomer = demoCustomers.find(
    (customer) => customer.id === customerId
  );

  /* =========================
     ADD PRODUCT TO CART
  ========================= */

  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    if (!quantity || quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} units are available.`);
      return;
    }

    const existingItem = cart.find(
      (item) => item.productId === selectedProduct.id
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + Number(quantity);

      if (updatedQuantity > selectedProduct.stock) {
        alert(`Only ${selectedProduct.stock} units are available.`);
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity: updatedQuantity,
                total: updatedQuantity * item.price,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: Number(quantity),
          price: selectedProduct.price,
          total: Number(quantity) * selectedProduct.price,
          stock: selectedProduct.stock,
        },
      ]);
    }

    setProductId("");
    setQuantity(1);
  };

  /* =========================
     REMOVE PRODUCT
  ========================= */

  const handleRemoveItem = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  /* =========================
     UPDATE QUANTITY
  ========================= */

  const handleQuantityChange = (productId, newQuantity) => {
    const item = cart.find((cartItem) => cartItem.productId === productId);

    if (!item) return;

    const value = Number(newQuantity);

    if (value < 1) return;

    if (value > item.stock) {
      alert(`Only ${item.stock} units are available.`);
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.productId === productId
          ? {
              ...cartItem,
              quantity: value,
              total: value * cartItem.price,
            }
          : cartItem
      )
    );
  };

  /* =========================
     BILL CALCULATION
  ========================= */

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    const value = Number(discountValue) || 0;

    if (value <= 0) return 0;

    if (discountType === "percentage") {
      return Math.min((subtotal * value) / 100, subtotal);
    }

    return Math.min(value, subtotal);
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(subtotal - discountAmount, 0);

  const taxAmount = useMemo(() => {
    const value = Number(tax) || 0;

    if (value <= 0) return 0;

    return (taxableAmount * value) / 100;
  }, [taxableAmount, tax]);

  const grandTotal = taxableAmount + taxAmount;

  /* =========================
     CREATE SALE
  ========================= */

  const handleCreateSale = () => {
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    const saleData = {
      customer: selectedCustomer.id,

      items: cart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),

      subtotal,

      discount: {
        type: discountType,
        value: Number(discountValue) || 0,
      },

      tax: taxAmount,

      grandTotal,

      paymentMethod,

      paymentStatus,
    };

    console.log("Sale Data:", saleData);

    alert("Sale created successfully!");

    // Later:
    // POST /api/sales
  };

  return (
    <div className="billing-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="billing-header">
        <div>
          <h2>Create New Sale</h2>
          <p>Create a sale, calculate the bill and record payment.</p>
        </div>

        <div className="invoice-preview">
          <span>Invoice</span>
          <strong>INV-0001</strong>
        </div>
      </div>

      {/* =========================
          CUSTOMER SECTION
      ========================= */}

      <section className="billing-card">

        <div className="section-title">
          <div className="section-number">1</div>

          <div>
            <h3>Customer Information</h3>
            <p>Select the customer for this sale.</p>
          </div>
        </div>

        <div className="form-grid">

          <div className="form-group">
            <label>Customer</label>

            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>

              {demoCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="customer-preview">
              <span>Selected Customer</span>
              <strong>{selectedCustomer.name}</strong>
              <small>{selectedCustomer.phone}</small>
            </div>
          )}

        </div>

      </section>

      {/* =========================
          PRODUCT SECTION
      ========================= */}

      <section className="billing-card">

        <div className="section-title">
          <div className="section-number">2</div>

          <div>
            <h3>Add Products</h3>
            <p>Select products and add them to the sale.</p>
          </div>
        </div>

        <div className="product-form">

          <div className="form-group product-select">
            <label>Product</label>

            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select product</option>

              {demoProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ₹
                  {product.price.toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group quantity-field">
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="stock-info">
            {selectedProduct ? (
              <>
                <span>Available Stock</span>
                <strong>{selectedProduct.stock}</strong>
              </>
            ) : (
              <span>Select a product</span>
            )}
          </div>

          <button
            type="button"
            className="add-product-button"
            onClick={handleAddProduct}
          >
            + Add Product
          </button>

        </div>

      </section>

      {/* =========================
          CART
      ========================= */}

      <section className="billing-card">

        <div className="section-title">
          <div className="section-number">3</div>

          <div>
            <h3>Order Summary</h3>
            <p>Review products added to this sale.</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">▤</div>
            <h4>No products added</h4>
            <p>Add products above to create the sale.</p>
          </div>
        ) : (
          <div className="cart-table-wrapper">

            <table className="cart-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {cart.map((item) => (
                  <tr key={item.productId}>

                    <td>
                      <div className="product-name">
                        {item.productName}
                      </div>
                      <small>{item.productId}</small>
                    </td>

                    <td>
                      ₹{item.price.toLocaleString("en-IN")}
                    </td>

                    <td>
                      <input
                        className="cart-quantity"
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.productId,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td className="item-total">
                      ₹{item.total.toLocaleString("en-IN")}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          handleRemoveItem(item.productId)
                        }
                      >
                        ×
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =========================
          BILL CALCULATION
      ========================= */}

      <div className="billing-bottom">

        <section className="billing-card calculation-card">

          <div className="section-title">
            <div className="section-number">4</div>

            <div>
              <h3>Bill Calculation</h3>
              <p>Apply discount and tax.</p>
            </div>
          </div>

          <div className="calculation-form">

            <div className="discount-row">

              <div className="form-group">
                <label>Discount Type</label>

                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value)
                  }
                >
                  <option value="percentage">
                    Percentage (%)
                  </option>

                  <option value="fixed">
                    Fixed Amount (₹)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value</label>

                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="form-group">
              <label>Tax (%)</label>

              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>

          </div>

          <div className="bill-summary">

            <div>
              <span>Subtotal</span>
              <strong>
                ₹{subtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div>
              <span>Discount</span>
              <strong className="discount-text">
                - ₹
                {discountAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div>
              <span>Tax</span>
              <strong>
                ₹
                {taxAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div className="grand-total-row">
              <span>Grand Total</span>

              <strong>
                ₹
                {grandTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

          </div>

        </section>

        {/* =========================
            PAYMENT
        ========================= */}

        <section className="billing-card payment-card">

          <div className="section-title">
            <div className="section-number">5</div>

            <div>
              <h3>Payment Details</h3>
              <p>Record payment information.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="BankTransfer">
                Bank Transfer
              </option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Status</label>

            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value)
              }
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

          <div className="payment-total">
            <span>Amount Payable</span>
            <strong>
              ₹
              {grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

          <button
            type="button"
            className="create-sale-button"
            onClick={handleCreateSale}
          >
            Create Sale & Generate Invoice
          </button>

        </section>

      </div>

    </div>
  );
}

export default Billing;