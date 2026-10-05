import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoices.css";
import { getInvoices } from "../../services/invoice";

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] =
    useState(null);
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();

        setInvoices(
          Array.isArray(data)
            ? data
            : data.data || []
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

    document.body.style.overflow = "hidden";
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


          <button
            type="button"
            className="invoice-filter-btn"
            onClick={resetFilters}
          >
            Reset
          </button>

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
                          {Array.isArray(
                            invoice.items
                          )
                            ? invoice.items.length
                            : invoice.items || 0}
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
                  {Array.isArray(
                    selectedInvoice.items
                  )
                    ? selectedInvoice.items.length
                    : selectedInvoice.items || 0}{" "}
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