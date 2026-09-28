import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Return.css";

const initialReturns = [
  {
    id: "RET-0001",
    invoiceId: "INV-0021",
    saleId: "SALE-0001",
    customer: "Rahul Kumar",
    phone: "9123456780",
    date: "28 Sep 2026",
    items: 2,
    amount: 2500,
    reason: "Damaged Product",
    refundMethod: "Original Payment",
    status: "Pending",
    notes: "Product received in damaged condition.",
  },
  {
    id: "RET-0002",
    invoiceId: "INV-0018",
    saleId: "SALE-0002",
    customer: "Priya Sharma",
    phone: "9988776655",
    date: "27 Sep 2026",
    items: 1,
    amount: 1200,
    reason: "Wrong Product",
    refundMethod: "UPI",
    status: "Approved",
    notes: "Wrong product was delivered to the customer.",
  },
  {
    id: "RET-0003",
    invoiceId: "INV-0015",
    saleId: "SALE-0003",
    customer: "Arun Kumar",
    phone: "9876543211",
    date: "25 Sep 2026",
    items: 3,
    amount: 4800,
    reason: "Customer Changed Mind",
    refundMethod: "Cash",
    status: "Refunded",
    notes: "Return accepted and refund completed.",
  },
  {
    id: "RET-0004",
    invoiceId: "INV-0012",
    saleId: "SALE-0004",
    customer: "Sneha Reddy",
    phone: "9012345678",
    date: "24 Sep 2026",
    items: 1,
    amount: 1800,
    reason: "Defective Product",
    refundMethod: "Original Payment",
    status: "Rejected",
    notes: "Return request does not meet return policy.",
  },
];

function Return() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState(initialReturns);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selectedReturn, setSelectedReturn] = useState(null);

  // =========================
  // FILTER RETURNS
  // =========================

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        item.id.toLowerCase().includes(searchText) ||
        item.invoiceId.toLowerCase().includes(searchText) ||
        item.saleId.toLowerCase().includes(searchText) ||
        item.customer.toLowerCase().includes(searchText) ||
        item.phone.includes(searchText);

      const matchesStatus =
        status === "All Status" ||
        item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [returns, search, status]);

  // =========================
  // STATISTICS
  // =========================

  const totalReturns = returns.length;

  const pendingReturns = returns.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedReturns = returns.filter(
    (item) => item.status === "Approved"
  ).length;

  const refundedReturns = returns.filter(
    (item) => item.status === "Refunded"
  ).length;

  const rejectedReturns = returns.filter(
    (item) => item.status === "Rejected"
  ).length;

  const totalRefundAmount = returns
    .filter((item) => item.status === "Refunded")
    .reduce((sum, item) => sum + item.amount, 0);

  // =========================
  // CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================
  // NEW RETURN
  // =========================

  const handleNewReturn = () => {
    navigate("/returns/new");
  };

  // =========================
  // VIEW RETURN
  // ONLY VIEW BUTTON OPENS DETAILS
  // =========================

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeReturnDetails = () => {
    setSelectedReturn(null);
  };

  // =========================
  // RESET FILTERS
  // =========================

  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
  };

  // =========================
  // APPROVE RETURN
  // =========================

  const handleApproveReturn = (returnId) => {
    setReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === returnId
          ? {
              ...item,
              status: "Approved",
            }
          : item
      )
    );

    setSelectedReturn((current) =>
      current
        ? {
            ...current,
            status: "Approved",
          }
        : null
    );
  };

  // =========================
  // REJECT RETURN
  // =========================

  const handleRejectReturn = (returnId) => {
    setReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === returnId
          ? {
              ...item,
              status: "Rejected",
            }
          : item
      )
    );

    setSelectedReturn((current) =>
      current
        ? {
            ...current,
            status: "Rejected",
          }
        : null
    );
  };

  // =========================
  // PROCESS REFUND
  // =========================

  const handleProcessRefund = (returnId) => {
    setReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === returnId
          ? {
              ...item,
              status: "Refunded",
            }
          : item
      )
    );

    setSelectedReturn((current) =>
      current
        ? {
            ...current,
            status: "Refunded",
          }
        : null
    );
  };

  // =========================
  // VIEW INVOICE
  // =========================

  const handleViewInvoice = () => {
    if (!selectedReturn) return;

    closeReturnDetails();
    navigate("/invoices");
  };

  return (
    <div className="returns-page">

      {/* ================= HEADER ================= */}

      <div className="returns-header">

        <div>
          <h1>Returns</h1>

          <p>
            Manage product returns, approvals and refunds.
          </p>
        </div>

        <button
          type="button"
          className="primary-return-btn"
          onClick={handleNewReturn}
        >
          + New Return
        </button>

      </div>


      {/* ================= STATISTICS ================= */}

      <div className="returns-stats">

        <div className="return-stat-card">

          <div className="return-stat-icon purple">
            ↩
          </div>

          <div>
            <span>Total Returns</span>

            <strong>
              {totalReturns}
            </strong>
          </div>

        </div>


        <div className="return-stat-card">

          <div className="return-stat-icon orange">
            ◷
          </div>

          <div>
            <span>Pending Returns</span>

            <strong>
              {pendingReturns}
            </strong>
          </div>

        </div>


        <div className="return-stat-card">

          <div className="return-stat-icon blue">
            ✓
          </div>

          <div>
            <span>Approved</span>

            <strong>
              {approvedReturns}
            </strong>
          </div>

        </div>


        <div className="return-stat-card">

          <div className="return-stat-icon green">
            ₹
          </div>

          <div>
            <span>Refunded Amount</span>

            <strong>
              {formatCurrency(totalRefundAmount)}
            </strong>
          </div>

        </div>

      </div>


      {/* ================= ADDITIONAL SUMMARY ================= */}

      <div className="return-summary-strip">

        <div>
          <span>Refunded Returns</span>

          <strong>
            {refundedReturns}
          </strong>
        </div>


        <div>
          <span>Rejected Returns</span>

          <strong>
            {rejectedReturns}
          </strong>
        </div>


        <div>
          <span>Total Refund Value</span>

          <strong>
            {formatCurrency(totalRefundAmount)}
          </strong>
        </div>

      </div>


      {/* ================= RETURNS TABLE ================= */}

      <div className="returns-table-card">

        {/* ================= TOOLBAR ================= */}

        <div className="returns-toolbar">

          <div className="return-search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search return, invoice or customer..."
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

            <option value="All Status">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Rejected">
              Rejected
            </option>

            <option value="Refunded">
              Refunded
            </option>

          </select>


          <button
            type="button"
            className="return-filter-btn"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>


        {/* ================= TABLE ================= */}

        <div className="return-table-wrapper">

          <table>

            <thead>

              <tr>
                <th>RETURN ID</th>
                <th>INVOICE ID</th>
                <th>CUSTOMER</th>
                <th>MOBILE</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>

            </thead>


            <tbody>

              {filteredReturns.length > 0 ? (

                filteredReturns.map((item) => (

                  <tr key={item.id}>

                    {/* ================= RETURN ID ================= */}

                    <td>
                      <span className="return-id-text">
                        {item.id}
                      </span>
                    </td>


                    {/* ================= INVOICE ID ================= */}

                    <td>
                      <span className="invoice-id-text">
                        {item.invoiceId}
                      </span>
                    </td>


                    {/* ================= CUSTOMER ================= */}

                    <td>

                      <div className="return-customer-cell">

                        <strong>
                          {item.customer}
                        </strong>

                      </div>

                    </td>


                    {/* ================= MOBILE ================= */}

                    <td>

                      <div className="return-mobile-cell">
                        {item.phone}
                      </div>

                    </td>


                    {/* ================= DATE ================= */}

                    <td>
                      {item.date}
                    </td>


                    {/* ================= ITEMS ================= */}

                    <td>

                      <span className="return-item-badge">
                        {item.items}
                      </span>

                    </td>


                    {/* ================= AMOUNT ================= */}

                    <td>

                      <strong className="return-amount">
                        {formatCurrency(item.amount)}
                      </strong>

                    </td>


                    {/* ================= STATUS ================= */}

                    <td>

                      <span
                        className={`return-status-badge ${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>

                    </td>


                    {/* ================= ACTION ================= */}

                    <td>

                      <button
                        type="button"
                        className="return-view-btn"
                        onClick={() =>
                          handleViewReturn(item)
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="9">

                    <div className="return-empty-state">

                      <div className="return-empty-icon">
                        ↩
                      </div>

                      <h3>
                        No returns found
                      </h3>

                      <p>
                        Try changing your search or status filter.
                      </p>

                      <button
                        type="button"
                        className="return-reset-empty-btn"
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


      {/* ================================================= */}
      {/* RETURN DETAILS MODAL */}
      {/* ================================================= */}

      {selectedReturn && (

        <div
          className="return-modal-overlay"
          onClick={closeReturnDetails}
        >

          <div
            className="return-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ================= MODAL HEADER ================= */}

            <div className="return-modal-header">

              <div>

                <span className="return-modal-label">
                  RETURN DETAILS
                </span>

                <h2>
                  {selectedReturn.id}
                </h2>

                <p>
                  Return request and refund information
                </p>

              </div>


              <button
                type="button"
                className="return-modal-close"
                onClick={closeReturnDetails}
                aria-label="Close return details"
              >
                ×
              </button>

            </div>


            {/* ================= BASIC DETAILS ================= */}

            <div className="return-detail-grid">

              {/* Customer */}

              <div className="return-detail-box">

                <span>
                  Customer
                </span>

                <strong>
                  {selectedReturn.customer}
                </strong>

                <small>
                  {selectedReturn.phone}
                </small>

              </div>


              {/* Return Date */}

              <div className="return-detail-box">

                <span>
                  Return Date
                </span>

                <strong>
                  {selectedReturn.date}
                </strong>

              </div>


              {/* Invoice */}

              <div className="return-detail-box">

                <span>
                  Original Invoice
                </span>

                <strong>
                  {selectedReturn.invoiceId}
                </strong>

              </div>


              {/* Sale */}

              <div className="return-detail-box">

                <span>
                  Original Sale
                </span>

                <strong>
                  {selectedReturn.saleId}
                </strong>

              </div>


              {/* Reason */}

              <div className="return-detail-box">

                <span>
                  Return Reason
                </span>

                <strong>
                  {selectedReturn.reason}
                </strong>

              </div>


              {/* Status */}

              <div className="return-detail-box">

                <span>
                  Current Status
                </span>

                <span
                  className={`return-status-badge ${selectedReturn.status.toLowerCase()}`}
                >
                  {selectedReturn.status}
                </span>

              </div>

            </div>


            {/* ================= RETURN SUMMARY ================= */}

            <div className="return-summary-section">

              <div className="return-section-heading">

                <div>

                  <h3>
                    Return Summary
                  </h3>

                  <p>
                    Products included in this return request.
                  </p>

                </div>

                <span>
                  {selectedReturn.items} Items
                </span>

              </div>


              <div className="return-product-row">

                <div>

                  <strong>
                    Returned Products
                  </strong>

                  <span>
                    {selectedReturn.items} product
                    {selectedReturn.items > 1 ? "s" : ""} included
                  </span>

                </div>

                <strong>
                  {formatCurrency(selectedReturn.amount)}
                </strong>

              </div>

            </div>


            {/* ================= REFUND DETAILS ================= */}

            <div className="refund-details-section">

              <div className="refund-detail-row">

                <span>
                  Refund Method
                </span>

                <strong>
                  {selectedReturn.refundMethod}
                </strong>

              </div>


              <div className="refund-detail-row">

                <span>
                  Refund Amount
                </span>

                <strong className="refund-amount">
                  {formatCurrency(selectedReturn.amount)}
                </strong>

              </div>


              <div className="refund-detail-row">

                <span>
                  Return Reason
                </span>

                <strong>
                  {selectedReturn.reason}
                </strong>

              </div>

            </div>


            {/* ================= NOTES ================= */}

            <div className="return-notes">

              <span>
                Notes
              </span>

              <p>
                {selectedReturn.notes ||
                  "No additional notes provided."}
              </p>

            </div>


            {/* ================= MODAL ACTIONS ================= */}

            <div className="return-modal-footer">

              <button
                type="button"
                className="return-secondary-btn"
                onClick={closeReturnDetails}
              >
                Close
              </button>


              {/* Pending Actions */}

              {selectedReturn.status === "Pending" && (

                <>

                  <button
                    type="button"
                    className="return-reject-btn"
                    onClick={() =>
                      handleRejectReturn(
                        selectedReturn.id
                      )
                    }
                  >
                    Reject Return
                  </button>


                  <button
                    type="button"
                    className="return-approve-btn"
                    onClick={() =>
                      handleApproveReturn(
                        selectedReturn.id
                      )
                    }
                  >
                    Approve Return
                  </button>

                </>

              )}


              {/* Approved Action */}

              {selectedReturn.status === "Approved" && (

                <button
                  type="button"
                  className="return-refund-btn"
                  onClick={() =>
                    handleProcessRefund(
                      selectedReturn.id
                    )
                  }
                >
                  Process Refund
                </button>

              )}


              {/* Refunded Action */}

              {selectedReturn.status === "Refunded" && (

                <button
                  type="button"
                  className="return-invoice-btn"
                  onClick={handleViewInvoice}
                >
                  View Invoice
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Return;