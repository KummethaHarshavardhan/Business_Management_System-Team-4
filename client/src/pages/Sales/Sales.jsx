import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sales.css";

const initialSales = [
  {
    id: "SALE-0001",
    customer: "Walk-in Customer",
    phone: "9876543210",
    date: "28 Sep 2026",
    items: 3,
    amount: 12500,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    discount: 500,
    tax: 2160,
  },
  {
    id: "SALE-0002",
    customer: "Rahul Kumar",
    phone: "9123456780",
    date: "27 Sep 2026",
    items: 2,
    amount: 8500,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    discount: 0,
    tax: 1296,
  },
  {
    id: "SALE-0003",
    customer: "Priya Sharma",
    phone: "9988776655",
    date: "26 Sep 2026",
    items: 4,
    amount: 15600,
    paymentMethod: "Credit",
    paymentStatus: "Pending",
    discount: 600,
    tax: 2376,
  },
];

function Sales() {
  const navigate = useNavigate();

  const [sales] = useState(initialSales);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selectedSale, setSelectedSale] = useState(null);

  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        sale.id.toLowerCase().includes(searchText) ||
        sale.customer.toLowerCase().includes(searchText) ||
        sale.phone.includes(searchText);

      const matchesStatus =
        status === "All Status" ||
        sale.paymentStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, status]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalAmount = sales.reduce(
    (sum, sale) => sum + Number(sale.amount || 0),
    0
  );

  const paidSales = sales.filter(
    (sale) => sale.paymentStatus === "Paid"
  ).length;

  const pendingSales = sales.filter(
    (sale) => sale.paymentStatus === "Pending"
  ).length;

  // =====================================================
  // CURRENCY FORMAT
  // =====================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // NEW SALE
  // =====================================================

  const handleNewSale = () => {
    navigate("/sales/new");
  };

  // =====================================================
  // OPEN SALE DETAILS
  // =====================================================

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
  };

  // =====================================================
  // CLOSE SALE DETAILS
  // =====================================================

  const closeSaleDetails = () => {
    setSelectedSale(null);
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
  };

  // =====================================================
  // VIEW INVOICE
  // =====================================================

  const handleViewInvoice = () => {
    closeSaleDetails();
    navigate("/invoices");
  };

  // =====================================================
  // CALCULATE SUBTOTAL
  // =====================================================

  const getSubtotal = (sale) => {
    return (
      Number(sale.amount || 0) -
      Number(sale.tax || 0) +
      Number(sale.discount || 0)
    );
  };

  return (
    <div className="sales-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sales-header">

        <div>
          <h1>Sales</h1>

          <p>
            View and manage all sales transactions.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={handleNewSale}
        >
          + New Sale
        </button>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="sales-stats">

        {/* Total Sales */}

        <div className="stat-card">

          <div className="stat-icon purple">
            ₹
          </div>

          <div>
            <span>Total Sales</span>

            <strong>
              {sales.length}
            </strong>
          </div>

        </div>


        {/* Total Amount */}

        <div className="stat-card">

          <div className="stat-icon green">
            ₹
          </div>

          <div>
            <span>Total Amount</span>

            <strong>
              {formatCurrency(totalAmount)}
            </strong>
          </div>

        </div>


        {/* Paid Sales */}

        <div className="stat-card">

          <div className="stat-icon blue">
            ✓
          </div>

          <div>
            <span>Paid Sales</span>

            <strong>
              {paidSales}
            </strong>
          </div>

        </div>


        {/* Pending Sales */}

        <div className="stat-card">

          <div className="stat-icon orange">
            ◷
          </div>

          <div>
            <span>Pending Sales</span>

            <strong>
              {pendingSales}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          SALES TABLE CARD
      ===================================================== */}

      <div className="sales-table-card">

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="sales-toolbar">

          {/* Search */}

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search sale, customer or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* Status Filter */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="All Status">
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


          {/* Reset */}

          <button
            type="button"
            className="filter-btn"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>SALE ID</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>AMOUNT</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>

            </thead>


            <tbody>

              {filteredSales.length > 0 ? (

                filteredSales.map((sale) => (

                  <tr key={sale.id}>

                    {/* SALE ID */}

                    <td>

                      <button
                        type="button"
                        className="sale-id"
                        onClick={() =>
                          handleViewSale(sale)
                        }
                      >
                        {sale.id}
                      </button>

                    </td>


                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-cell">

                        <strong>
                          {sale.customer}
                        </strong>

                        <span>
                          {sale.phone}
                        </span>

                      </div>

                    </td>


                    {/* DATE */}

                    <td>
                      {sale.date}
                    </td>


                    {/* ITEMS */}

                    <td>

                      <span className="item-badge">
                        {sale.items}
                      </span>

                    </td>


                    {/* AMOUNT */}

                    <td>

                      <strong className="amount">
                        {formatCurrency(
                          sale.amount
                        )}
                      </strong>

                    </td>


                    {/* PAYMENT */}

                    <td>
                      {sale.paymentMethod}
                    </td>


                    {/* STATUS */}

                    <td>

                      {/* IMPORTANT:
                          Status is NOT clickable.
                          Only View button / Sale ID opens details.
                      */}

                      <span
                        className={`status-badge ${sale.paymentStatus.toLowerCase()}`}
                      >
                        {sale.paymentStatus}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        type="button"
                        className="view-btn"
                        onClick={() =>
                          handleViewSale(sale)
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="8">

                    <div className="empty-state">

                      <div className="empty-icon">
                        ▤
                      </div>

                      <h3>
                        No sales found
                      </h3>

                      <p>
                        Try changing your search
                        or filter.
                      </p>

                      <button
                        type="button"
                        className="reset-empty-btn"
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
          SALE DETAILS MODAL
      ===================================================== */}

      {selectedSale && (

        <div
          className="sale-modal-overlay"
          onClick={closeSaleDetails}
        >

          <div
            className="sale-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="sale-modal-header">

              <div>

                <span className="modal-label">
                  SALE DETAILS
                </span>

                <h2>
                  {selectedSale.id}
                </h2>

                <p>
                  Sale transaction details
                </p>

              </div>


              <button
                type="button"
                className="modal-close-btn"
                onClick={closeSaleDetails}
                aria-label="Close sale details"
              >
                ×
              </button>

            </div>


            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <div className="sale-detail-grid">

              {/* Customer */}

              <div className="detail-box">

                <span>
                  Customer
                </span>

                <strong>
                  {selectedSale.customer}
                </strong>

                <small>
                  {selectedSale.phone}
                </small>

              </div>


              {/* Date */}

              <div className="detail-box">

                <span>
                  Sale Date
                </span>

                <strong>
                  {selectedSale.date}
                </strong>

              </div>


              {/* Payment Method */}

              <div className="detail-box">

                <span>
                  Payment Method
                </span>

                <strong>
                  {selectedSale.paymentMethod}
                </strong>

              </div>


              {/* Payment Status */}

              <div className="detail-box">

                <span>
                  Payment Status
                </span>

                {/* Also NON-clickable inside modal */}

                <span
                  className={`status-badge ${selectedSale.paymentStatus.toLowerCase()}`}
                >
                  {selectedSale.paymentStatus}
                </span>

              </div>

            </div>


            {/* =================================================
                SALE SUMMARY
            ================================================= */}

            <div className="sale-items-section">

              <div className="section-heading">

                <h3>
                  Sale Summary
                </h3>

                <span>
                  {selectedSale.items} Items
                </span>

              </div>


              <div className="sale-item-row">

                <div>

                  <strong>
                    Products
                  </strong>

                  <span>
                    {selectedSale.items} products
                    included in this sale
                  </span>

                </div>

                <strong>
                  {formatCurrency(
                    selectedSale.amount
                  )}
                </strong>

              </div>

            </div>


            {/* =================================================
                CALCULATIONS
            ================================================= */}

            <div className="sale-calculation">

              {/* Subtotal */}

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    getSubtotal(selectedSale)
                  )}
                </strong>

              </div>


              {/* Discount */}

              <div>

                <span>
                  Discount
                </span>

                <strong className="discount-text">
                  -{formatCurrency(
                    selectedSale.discount
                  )}
                </strong>

              </div>


              {/* Tax */}

              <div>

                <span>
                  Tax
                </span>

                <strong>
                  {formatCurrency(
                    selectedSale.tax
                  )}
                </strong>

              </div>


              {/* Grand Total */}

              <div className="grand-total-row">

                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    selectedSale.amount
                  )}
                </strong>

              </div>

            </div>


            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="sale-modal-footer">

              <button
                type="button"
                className="secondary-modal-btn"
                onClick={closeSaleDetails}
              >
                Close
              </button>


              <button
                type="button"
                className="primary-modal-btn"
                onClick={handleViewInvoice}
              >
                View Invoice
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Sales;