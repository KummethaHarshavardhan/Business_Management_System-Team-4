import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewReturn.css";

const invoiceData = [
  {
    invoiceId: "INV-0021",
    customer: "Rahul Kumar",
    phone: "9123456780",
    invoiceDate: "28 Sep 2026",
    products: [
      {
        id: 1,
        name: "Laptop Bag",
        soldQty: 2,
        unitPrice: 1250,
      },
      {
        id: 2,
        name: "Wireless Mouse",
        soldQty: 1,
        unitPrice: 500,
      },
    ],
  },
  {
    invoiceId: "INV-0018",
    customer: "Priya Sharma",
    phone: "9988776655",
    invoiceDate: "27 Sep 2026",
    products: [
      {
        id: 3,
        name: "Keyboard",
        soldQty: 1,
        unitPrice: 1200,
      },
    ],
  },
  {
    invoiceId: "INV-0015",
    customer: "Arun Kumar",
    phone: "9876543211",
    invoiceDate: "25 Sep 2026",
    products: [
      {
        id: 4,
        name: "Office Chair",
        soldQty: 3,
        unitPrice: 1600,
      },
    ],
  },
  {
    invoiceId: "INV-0012",
    customer: "Sneha Reddy",
    phone: "9012345678",
    invoiceDate: "24 Sep 2026",
    products: [
      {
        id: 5,
        name: "Monitor",
        soldQty: 1,
        unitPrice: 1800,
      },
    ],
  },
];

const reasons = [
  "Damaged Product",
  "Defective Product",
  "Wrong Product",
  "Customer Changed Mind",
  "Other",
];

const refundMethods = [
  "Original Payment",
  "UPI",
  "Cash",
  "Bank Transfer",
];

function NewReturn() {
  const navigate = useNavigate();

  const [invoiceId, setInvoiceId] = useState("");
  const [returnDate, setReturnDate] = useState("28 Sep 2026");
  const [returnReason, setReturnReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [returnQuantities, setReturnQuantities] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedInvoice = useMemo(() => {
    return invoiceData.find(
      (invoice) => invoice.invoiceId === invoiceId
    );
  }, [invoiceId]);

  const products = selectedInvoice?.products || [];

  const totalItems = Object.values(returnQuantities).reduce(
    (total, quantity) => {
      return total + Number(quantity || 0);
    },
    0
  );

  const totalRefundAmount = products.reduce(
    (total, product) => {
      const quantity = Number(
        returnQuantities[product.id] || 0
      );

      return total + quantity * product.unitPrice;
    },
    0
  );

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const handleInvoiceChange = (event) => {
    const selectedId = event.target.value;

    setInvoiceId(selectedId);
    setReturnQuantities({});

    setErrors((current) => ({
      ...current,
      invoiceId: "",
      products: "",
      amount: "",
    }));
  };

  const handleQuantityChange = (product, value) => {
    if (value === "") {
      setReturnQuantities((current) => ({
        ...current,
        [product.id]: "",
      }));
      return;
    }

    const quantity = Number(value);

    if (
      Number.isNaN(quantity) ||
      quantity < 0
    ) {
      return;
    }

    const safeQuantity = Math.min(
      Math.floor(quantity),
      product.soldQty
    );

    setReturnQuantities((current) => ({
      ...current,
      [product.id]: safeQuantity,
    }));

    setErrors((current) => ({
      ...current,
      products: "",
      amount: "",
    }));
  };

  const increaseQuantity = (product) => {
    const currentQuantity = Number(
      returnQuantities[product.id] || 0
    );

    if (
      currentQuantity >= product.soldQty
    ) {
      return;
    }

    handleQuantityChange(
      product,
      currentQuantity + 1
    );
  };

  const decreaseQuantity = (product) => {
    const currentQuantity = Number(
      returnQuantities[product.id] || 0
    );

    if (currentQuantity <= 0) {
      return;
    }

    handleQuantityChange(
      product,
      currentQuantity - 1
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!invoiceId) {
      newErrors.invoiceId =
        "Please select an invoice.";
    }

    if (!returnReason) {
      newErrors.returnReason =
        "Please select a return reason.";
    }

    if (!refundMethod) {
      newErrors.refundMethod =
        "Please select a refund method.";
    }

    if (totalItems === 0) {
      newErrors.products =
        "Please select at least one item to return.";
    }

    if (totalRefundAmount <= 0) {
      newErrors.amount =
        "Return amount must be greater than ₹0.00.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedInvoice) {
      return;
    }

    setIsSubmitting(true);

    const newReturn = {
      id: `RET-${String(
        Math.floor(Math.random() * 9000) + 1000
      )}`,
      invoiceId: selectedInvoice.invoiceId,
      saleId: selectedInvoice.invoiceId.replace(
        "INV",
        "SALE"
      ),
      customer: selectedInvoice.customer,
      phone: selectedInvoice.phone,
      date: returnDate,
      items: totalItems,
      amount: totalRefundAmount,
      reason: returnReason,
      refundMethod,
      status: "Pending",
      notes:
        notes.trim() ||
        "Return request submitted for review.",
    };

    const existingReturns = JSON.parse(
      localStorage.getItem("returns") || "[]"
    );

    localStorage.setItem(
      "returns",
      JSON.stringify([
        newReturn,
        ...existingReturns,
      ])
    );

    setSuccessMessage(
      `Return ${newReturn.id} created successfully.`
    );

    setTimeout(() => {
      navigate("/returns");
    }, 1000);
  };

  const handleCancel = () => {
    if (isSubmitting) return;

    navigate("/returns");
  };

  return (
    <div className="new-return-page">

      {/* ================= HEADER ================= */}

      <div className="new-return-header">

        <div>
          <div className="new-return-breadcrumb">
            <button
              type="button"
              onClick={() => navigate("/returns")}
            >
              Returns
            </button>

            <span>/</span>

            <strong>New Return</strong>
          </div>

          <h1>Create New Return</h1>

          <p>
            Process a customer return and initiate
            the appropriate refund.
          </p>
        </div>

        <button
          type="button"
          className="new-return-back-btn"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          ← Back to Returns
        </button>

      </div>


      {/* ================= SUCCESS ================= */}

      {successMessage && (
        <div className="new-return-success">
          <div className="success-icon">
            ✓
          </div>

          <div>
            <strong>Return Created</strong>

            <p>{successMessage}</p>
          </div>
        </div>
      )}


      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="new-return-layout">

        {/* ================================================= */}
        {/* LEFT COLUMN */}
        {/* ================================================= */}

        <main className="new-return-main">

          {/* ================= SECTION 01 ================= */}

          <section className="new-return-card">

            <div className="new-return-card-header">

              <div className="section-heading">

                <span className="section-number">
                  01
                </span>

                <div>
                  <h2>
                    Invoice Information
                  </h2>

                  <p>
                    Select the original invoice
                    for this return.
                  </p>
                </div>

              </div>

            </div>


            <div className="new-return-card-body">

              <div className="new-return-form-group full-width">

                <label>
                  Invoice ID
                  <span>*</span>
                </label>

                <select
                  value={invoiceId}
                  onChange={handleInvoiceChange}
                  className={
                    errors.invoiceId
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select Invoice
                  </option>

                  {invoiceData.map((invoice) => (
                    <option
                      key={invoice.invoiceId}
                      value={invoice.invoiceId}
                    >
                      {invoice.invoiceId} —{" "}
                      {invoice.customer}
                    </option>
                  ))}
                </select>

                {errors.invoiceId && (
                  <small className="field-error">
                    {errors.invoiceId}
                  </small>
                )}

              </div>


              <div className="new-return-form-grid">

                <div className="new-return-info-box">
                  <span>Customer</span>

                  <strong>
                    {selectedInvoice?.customer ||
                      "—"}
                  </strong>
                </div>


                <div className="new-return-info-box">
                  <span>Mobile Number</span>

                  <strong>
                    {selectedInvoice?.phone ||
                      "—"}
                  </strong>
                </div>


                <div className="new-return-info-box">
                  <span>Invoice Date</span>

                  <strong>
                    {selectedInvoice?.invoiceDate ||
                      "—"}
                  </strong>
                </div>


                <div className="new-return-form-group">
                  <label>
                    Return Date
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={returnDate}
                    onChange={(event) =>
                      setReturnDate(
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>

            </div>

          </section>


          {/* ================= SECTION 02 ================= */}

          <section className="new-return-card">

            <div className="new-return-card-header">

              <div className="section-heading">

                <span className="section-number">
                  02
                </span>

                <div>
                  <h2>
                    Return Items
                  </h2>

                  <p>
                    Select the products and
                    quantities being returned.
                  </p>
                </div>

              </div>

              {selectedInvoice && (
                <span className="item-count-label">
                  {products.length} Products
                </span>
              )}

            </div>


            <div className="new-return-card-body">

              {!selectedInvoice ? (

                <div className="return-items-placeholder">

                  <div className="placeholder-icon">
                    ↩
                  </div>

                  <h3>
                    Select an invoice
                  </h3>

                  <p>
                    Choose an invoice above to
                    view its products.
                  </p>

                </div>

              ) : (

                <div className="return-products-table-wrapper">

                  <table className="return-products-table">

                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>SOLD QTY</th>
                        <th>RETURN QTY</th>
                        <th>UNIT PRICE</th>
                        <th>RETURN AMOUNT</th>
                      </tr>
                    </thead>

                    <tbody>

                      {products.map((product) => {

                        const quantity =
                          Number(
                            returnQuantities[
                              product.id
                            ] || 0
                          );

                        const amount =
                          quantity *
                          product.unitPrice;

                        return (
                          <tr key={product.id}>

                            <td>
                              <div className="return-product-name">

                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  Product ID: PRD-
                                  {String(
                                    product.id
                                  ).padStart(4, "0")}
                                </span>

                              </div>
                            </td>

                            <td>
                              <span className="sold-quantity">
                                {product.soldQty}
                              </span>
                            </td>

                            <td>

                              <div className="quantity-control">

                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      product
                                    )
                                  }
                                  disabled={
                                    quantity <= 0
                                  }
                                >
                                  −
                                </button>

                                <input
                                  type="number"
                                  min="0"
                                  max={
                                    product.soldQty
                                  }
                                  value={
                                    returnQuantities[
                                      product.id
                                    ] ?? ""
                                  }
                                  onChange={(event) =>
                                    handleQuantityChange(
                                      product,
                                      event.target.value
                                    )
                                  }
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      product
                                    )
                                  }
                                  disabled={
                                    quantity >=
                                    product.soldQty
                                  }
                                >
                                  +
                                </button>

                              </div>

                            </td>

                            <td>
                              {formatCurrency(
                                product.unitPrice
                              )}
                            </td>

                            <td>
                              <strong className="product-return-amount">
                                {formatCurrency(
                                  amount
                                )}
                              </strong>
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

              )}

              {errors.products && (
                <div className="products-error">
                  {errors.products}
                </div>
              )}

              {errors.amount && (
                <div className="products-error">
                  {errors.amount}
                </div>
              )}

            </div>

          </section>


          {/* ================================================= */}
          {/* SECTION 03 — RETURN DETAILS */}
          {/* EXACTLY BELOW RETURN ITEMS */}
          {/* ================================================= */}

          <section className="new-return-card return-details-card">

            <div className="new-return-card-header">

              <div className="section-heading">

                <span className="section-number">
                  03
                </span>

                <div>
                  <h2>
                    Return Details
                  </h2>

                  <p>
                    Provide the reason and refund
                    information.
                  </p>
                </div>

              </div>

            </div>


            <div className="new-return-card-body">

              <div className="new-return-form-grid">

                {/* RETURN REASON */}

                <div className="new-return-form-group">

                  <label>
                    Return Reason
                    <span>*</span>
                  </label>

                  <select
                    value={returnReason}
                    onChange={(event) => {
                      setReturnReason(
                        event.target.value
                      );

                      setErrors((current) => ({
                        ...current,
                        returnReason: "",
                      }));
                    }}
                    className={
                      errors.returnReason
                        ? "input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Reason
                    </option>

                    {reasons.map((reason) => (
                      <option
                        key={reason}
                        value={reason}
                      >
                        {reason}
                      </option>
                    ))}

                  </select>

                  {errors.returnReason && (
                    <small className="field-error">
                      {errors.returnReason}
                    </small>
                  )}

                </div>


                {/* REFUND METHOD */}

                <div className="new-return-form-group">

                  <label>
                    Refund Method
                    <span>*</span>
                  </label>

                  <select
                    value={refundMethod}
                    onChange={(event) => {
                      setRefundMethod(
                        event.target.value
                      );

                      setErrors((current) => ({
                        ...current,
                        refundMethod: "",
                      }));
                    }}
                    className={
                      errors.refundMethod
                        ? "input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Refund Method
                    </option>

                    {refundMethods.map(
                      (method) => (
                        <option
                          key={method}
                          value={method}
                        >
                          {method}
                        </option>
                      )
                    )}

                  </select>

                  {errors.refundMethod && (
                    <small className="field-error">
                      {errors.refundMethod}
                    </small>
                  )}

                </div>


                {/* NOTES */}

                <div className="new-return-form-group full-width">

                  <div className="notes-label-row">

                    <label>
                      Notes
                    </label>

                    <span>
                      {notes.length}/500
                    </span>

                  </div>

                  <textarea
                    rows="5"
                    maxLength="500"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Add any additional information about this return..."
                  />

                </div>

              </div>


              {/* ================= ACTION BUTTONS ================= */}

              <div className="return-details-actions">

                <button
                  type="button"
                  className="new-return-cancel-btn"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="new-return-submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >

                  {isSubmitting ? (
                    <>
                      <span className="button-spinner" />
                      Creating Return...
                    </>
                  ) : (
                    <>
                      Create Return
                      <span>→</span>
                    </>
                  )}

                </button>

              </div>

            </div>

          </section>

        </main>


        {/* ================================================= */}
        {/* RIGHT SIDEBAR */}
        {/* ================================================= */}

        <aside className="new-return-sidebar">

          {/* SUMMARY */}

          <div className="return-summary-card">

            <div className="summary-card-header">

              <div>
                <span>
                  RETURN SUMMARY
                </span>

                <h2>
                  Review Return
                </h2>
              </div>

              <div className="summary-icon">
                ↩
              </div>

            </div>


            <div className="summary-status">

              <span>Status</span>

              <strong>
                Pending
              </strong>

            </div>


            <div className="summary-divider" />


            <div className="summary-row">
              <span>Invoice</span>

              <strong>
                {invoiceId || "—"}
              </strong>
            </div>


            <div className="summary-row">
              <span>Customer</span>

              <strong>
                {selectedInvoice?.customer ||
                  "—"}
              </strong>
            </div>


            <div className="summary-row">
              <span>Return Items</span>

              <strong>
                {totalItems}
              </strong>
            </div>


            <div className="summary-row">
              <span>Refund Method</span>

              <strong>
                {refundMethod || "—"}
              </strong>
            </div>


            <div className="summary-divider" />


            <div className="summary-total">

              <span>
                Total Refund
              </span>

              <strong>
                {formatCurrency(
                  totalRefundAmount
                )}
              </strong>

            </div>

          </div>


          {/* POLICY */}

          <div className="return-info-card">

            <div className="info-card-icon">
              i
            </div>

            <div>

              <strong>
                Return Policy
              </strong>

              <p>
                Please verify the returned
                items before approving the
                refund. Return quantities
                cannot exceed the original
                sold quantity.
              </p>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default NewReturn;