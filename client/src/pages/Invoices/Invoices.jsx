import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoices.css";
import { getInvoices, updateInvoicePaymentStatus } from "../../services/invoice";

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] =
    useState(null);
  const [nextPaymentStatus, setNextPaymentStatus] = useState("Pending");
  const [paidAmountInput, setPaidAmountInput] = useState("0");
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();

        const invoiceData = Array.isArray(data)
          ? data
          : data.data || [];

        // Map the Team 4 invoice document to the shape this page already renders
        setInvoices(
          invoiceData.map((invoice) => ({
            ...invoice,
            id: invoice.invoiceNumber || invoice._id || invoice.id,
            customer:
              invoice.customerDetails?.name || invoice.customer || "",
            phone:
              invoice.customerDetails?.phone || invoice.phone || "",
            date: invoice.invoiceDate
              ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN")
              : invoice.date || "",
            amount: Number(invoice.grandTotal ?? invoice.amount ?? 0),
          }))
        );
      } catch (error) {
        console.error("Invoices API Error:", error);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const invoiceId = String(
        invoice.id || ""
      ).toLowerCase();

      const customer = String(
        invoice.customer || ""
      ).toLowerCase();

      const phone = String(
        invoice.phone || ""
      );

      const paymentStatus = String(
        invoice.paymentStatus || ""
      );

      const matchesSearch =
        invoiceId.includes(searchText) ||
        customer.includes(searchText) ||
        phone.includes(searchText);

      const matchesStatus =
        status === "All" ||
        paymentStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, status]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total +
      Number(
        invoice.grandTotal ||
          invoice.amount ||
          0
      ),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === "Paid"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === "Pending"
  ).length;

  /* =====================================================
     CURRENCY
  ===================================================== */

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /* =====================================================
     ACTIONS
  ===================================================== */

  const handleNewInvoice = () => {
    navigate("/invoices/new");
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setNextPaymentStatus(invoice.paymentStatus || "Pending");
    setPaidAmountInput(String(invoice.paidAmount ?? (invoice.paymentStatus === "Paid" ? invoice.grandTotal ?? invoice.amount ?? 0 : 0)));
    setPaymentMessage("");

    document.body.style.overflow = "hidden";
  };

  const handleSavePaymentStatus = async () => {
    if (!selectedInvoice) return;
    setPaymentSaving(true);
    setPaymentMessage("");
    try {
      const total = Number(selectedInvoice.grandTotal ?? selectedInvoice.amount ?? 0);
      const paidAmount = nextPaymentStatus === "Paid"
        ? total
        : nextPaymentStatus === "Pending"
          ? 0
          : Number(paidAmountInput);
      const response = await updateInvoicePaymentStatus(
        selectedInvoice._id,
        nextPaymentStatus,
        paidAmount
      );
      const updated = response.invoice;
      const normalized = {
        ...updated,
        id: updated.invoiceNumber || updated._id || updated.id,
        customer: updated.customerDetails?.name || selectedInvoice.customer || "",
        phone: updated.customerDetails?.phone || selectedInvoice.phone || "",
        date: updated.invoiceDate ? new Date(updated.invoiceDate).toLocaleDateString("en-IN") : selectedInvoice.date,
        amount: Number(updated.grandTotal ?? updated.amount ?? 0),
      };
      setInvoices((current) => current.map((item) => String(item._id) === String(updated._id) ? normalized : item));
      setSelectedInvoice(normalized);
      setPaidAmountInput(String(normalized.paidAmount ?? paidAmount));
      setPaymentMessage("Payment status saved successfully.");
    } catch (error) {
      setPaymentMessage(error.message || "Could not update payment status.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const closeInvoiceDetails = () => {
    setSelectedInvoice(null);

    document.body.style.overflow = "";
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
  };

  /* =====================================================
     SUBTOTAL
  ===================================================== */

  const getSubtotal = (invoice) => {
    if (
      invoice.subtotal !== undefined &&
      invoice.subtotal !== null
    ) {
      return Number(invoice.subtotal);
    }

    const grandTotal = Number(
      invoice.grandTotal ||
        invoice.amount ||
        0
    );

    const tax = Number(
      invoice.taxAmount || 0
    );

    const discount = Number(
      invoice.discountAmount || 0
    );

    return (
      grandTotal -
      tax +
      discount
    );
  };

  return (
    <div className="invoices-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="invoices-header">

        <div>

          <h1>Invoices</h1>

          <p>
            View and manage all generated invoices.
          </p>

        </div>

        <button
          type="button"
          className="invoice-primary-btn"
          onClick={handleNewInvoice}
        >
          + New Invoice
        </button>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="invoice-summary">

        <div className="invoice-summary-card">

          <div className="summary-icon purple">
            ▤
          </div>

          <div>

            <span>Total Invoices</span>

            <strong>
              {invoices.length}
            </strong>

          </div>

        </div>


        <div className="invoice-summary-card">

          <div className="summary-icon green">
            ₹
          </div>

          <div>

            <span>Total Amount</span>

            <strong>
              {formatCurrency(totalAmount)}
            </strong>

          </div>

        </div>


        <div className="invoice-summary-card">

          <div className="summary-icon blue">
            ✓
          </div>

          <div>

            <span>Paid</span>

            <strong>
              {paidInvoices}
            </strong>

          </div>

        </div>


        <div className="invoice-summary-card">

          <div className="summary-icon orange">
            ◷
          </div>

          <div>

            <span>Pending</span>

            <strong>
              {pendingInvoices}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="invoice-table-card">

        <div className="invoice-filters">

          <div className="invoice-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >

            <option value="All">
              All Status
            </option>

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


        {/* =====================================================
            INVOICE TABLE
        ===================================================== */}

        <div className="invoice-table-wrapper">

          <table className="invoice-table">

            <thead>

              <tr>

                <th>INVOICE</th>

                <th>CUSTOMER</th>

                <th>MOBILE</th>

                <th>DATE</th>

                <th>ITEMS</th>

                <th>AMOUNT</th>

                <th>PAYMENT</th>

                <th>STATUS</th>

                <th>ACTION</th>

              </tr>

            </thead>


            <tbody>

              {filteredInvoices.length > 0 ? (

                filteredInvoices.map(
                  (invoice) => (

                    <tr key={invoice.id}>

                      <td>

                        <button
                          type="button"
                          className="invoice-number invoice-number-btn"
                          onClick={() =>
                            handleViewInvoice(invoice)
                          }
                        >
                          {invoice.id}
                        </button>

                      </td>


                      <td>

                        <div className="customer-info">

                          <strong>
                            {invoice.customer}
                          </strong>

                        </div>

                      </td>


                      <td>

                        <div className="customer-info">

                          <span className="invoice-mobile">
                            {invoice.phone}
                          </span>

                        </div>

                      </td>


                      <td>
                        {invoice.date}
                      </td>


                      <td>

                        <span className="item-badge">
                          {Array.isArray(invoice.items)
                            ? invoice.items.reduce(
                                (total, item) => total + Number(item.quantity || 0),
                                0
                              )
                            : Number(invoice.items || 0)}
                        </span>

                      </td>


                      <td>

                        <strong className="invoice-amount">
                          {formatCurrency(
                            invoice.grandTotal ??
                              invoice.amount
                          )}
                        </strong>

                      </td>


                      <td>
                        {invoice.paymentMethod}
                      </td>


                      <td>

                        <span
                          className={`payment-badge ${String(
                            invoice.paymentStatus || ""
                          ).toLowerCase()}`}
                        >
                          {invoice.paymentStatus}
                        </span>

                      </td>


                      <td>

                        <button
                          type="button"
                          className="view-invoice-btn"
                          onClick={() =>
                            handleViewInvoice(
                              invoice
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td colSpan="9">

                    <div className="empty-invoices">

                      <div className="empty-icon">
                        ▤
                      </div>

                      <h3>
                        No invoices found
                      </h3>

                      <p>
                        Try changing your search
                        or filter.
                      </p>

                      <button
                        type="button"
                        className="empty-reset-btn"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </button>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          INVOICE DETAILS MODAL
      ===================================================== */}

      {selectedInvoice && (

        <div
          className="sale-modal-overlay"
          onClick={closeInvoiceDetails}
        >

          <div
            className="sale-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="sale-modal-header">

              <div>

                <span className="modal-label">
                  INVOICE DETAILS
                </span>

                <h2>
                  {selectedInvoice.id}
                </h2>

                <p>
                  Invoice transaction details
                </p>

              </div>


              <button
                type="button"
                className="modal-close-btn"
                onClick={closeInvoiceDetails}
                aria-label="Close invoice details"
              >
                ×
              </button>

            </div>


            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <div className="sale-detail-grid">

              <div className="detail-box">

                <span>
                  Customer
                </span>

                <strong>
                  {selectedInvoice.customer}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Mobile
                </span>

                <strong>
                  {selectedInvoice.phone}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Invoice Date
                </span>

                <strong>
                  {selectedInvoice.date}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Payment Method
                </span>

                <strong>
                  {selectedInvoice.paymentMethod}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Payment Status
                </span>

                <span
                  className={`status-badge ${String(
                    selectedInvoice.paymentStatus || ""
                  ).toLowerCase()}`}
                >
                  {selectedInvoice.paymentStatus}
                </span>
                <div className="payment-status-editor" style={{ marginTop: 10 }}>
                  <label htmlFor="invoice-payment-status" style={{ display: "block", marginBottom: 6 }}>Change payment status</label>
                  <select
                    id="invoice-payment-status"
                    value={nextPaymentStatus}
                    onChange={(e) => setNextPaymentStatus(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", border: "1px solid #d8deea", borderRadius: 8, background: "white" }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                  {nextPaymentStatus === "Partial" && (
                    <div style={{ marginTop: 8 }}>
                      <label htmlFor="invoice-paid-amount" style={{ display: "block", marginBottom: 6 }}>Amount received (₹)</label>
                      <input
                        id="invoice-paid-amount"
                        type="number"
                        min="0.01"
                        max={Math.max(0, Number(selectedInvoice.grandTotal ?? selectedInvoice.amount ?? 0) - 0.01)}
                        step="0.01"
                        value={paidAmountInput}
                        onChange={(e) => setPaidAmountInput(e.target.value)}
                        style={{ width: "100%", padding: "9px 10px", border: "1px solid #d8deea", borderRadius: 8, boxSizing: "border-box" }}
                      />
                    </div>
                  )}
                  <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                    Received: {formatCurrency(nextPaymentStatus === "Paid" ? (selectedInvoice.grandTotal ?? selectedInvoice.amount ?? 0) : nextPaymentStatus === "Pending" ? 0 : paidAmountInput)} · Balance: {formatCurrency(Math.max(0, Number(selectedInvoice.grandTotal ?? selectedInvoice.amount ?? 0) - (nextPaymentStatus === "Paid" ? Number(selectedInvoice.grandTotal ?? selectedInvoice.amount ?? 0) : nextPaymentStatus === "Pending" ? 0 : Number(paidAmountInput || 0))))}
                  </div>
                  <button type="button" onClick={handleSavePaymentStatus} disabled={paymentSaving} style={{ marginTop: 10, width: "100%", padding: "9px 12px", border: 0, borderRadius: 8, background: paymentSaving ? "#a5b4fc" : "#4f46e5", color: "white", fontWeight: 600, cursor: paymentSaving ? "wait" : "pointer" }}>
                    {paymentSaving ? "Saving..." : "Save Payment Status"}
                  </button>
                  {paymentMessage && <p role="status" style={{ marginTop: 8, fontSize: 13, color: paymentMessage.includes("successfully") ? "#047857" : "#b91c1c" }}>{paymentMessage}</p>}
                </div>

              </div>

            </div>


            {/* =================================================
                INVOICE SUMMARY
            ================================================= */}

            <div className="sale-items-section">

              <div className="section-heading">

                <h3>
                  Invoice Summary
                </h3>

                <span>
                  {Array.isArray(selectedInvoice.items)
                    ? selectedInvoice.items.reduce(
                        (total, item) => total + Number(item.quantity || 0),
                        0
                      )
                    : Number(selectedInvoice.items || 0)}{" "}
                  Items
                </span>

              </div>


              {Array.isArray(
                selectedInvoice.items
              ) ? (

                selectedInvoice.items.map(
                  (item, index) => (

                    <div
                      className="sale-item-row"
                      key={`${item.productName || "item"}-${index}`}
                    >

                      <div>

                        <strong>
                          {item.productName}
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
                          item.total
                        )}
                      </strong>

                    </div>

                  )
                )

              ) : (

                <div className="sale-item-row">

                  <div>

                    <strong>
                      Products
                    </strong>

                    <span>
                      {selectedInvoice.items ||
                        0}{" "}
                      products included
                    </span>

                  </div>

                  <strong>
                    {formatCurrency(
                      selectedInvoice.grandTotal ??
                        selectedInvoice.amount
                    )}
                  </strong>

                </div>

              )}

            </div>


            {/* =================================================
                CALCULATIONS
            ================================================= */}

            <div className="sale-calculation">

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    getSubtotal(
                      selectedInvoice
                    )
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Discount
                </span>

                <strong className="discount-text">
                  -{formatCurrency(
                    selectedInvoice.discountAmount
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Tax
                </span>

                <strong>
                  {formatCurrency(
                    selectedInvoice.taxAmount
                  )}
                </strong>

              </div>


              <div className="grand-total-row">

                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    selectedInvoice.grandTotal ??
                      selectedInvoice.amount
                  )}
                </strong>

              </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="sale-modal-footer">

              <button
                type="button"
                className="secondary-modal-btn"
                onClick={closeInvoiceDetails}
              >
                Close
              </button>


              <button
                type="button"
                className="invoice-print-btn"
                onClick={() =>
                  window.print()
                }
              >
                Print/Download PDF
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Invoices;