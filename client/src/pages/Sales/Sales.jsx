import { useMemo, useState, useEffect } from "react";
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

  /* =====================================================
     FILTER
  ===================================================== */

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

  /* =====================================================
     ESC KEY
  ===================================================== */

  useEffect(() => {
    if (!selectedSale) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedSale(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [selectedSale]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalAmount = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.amount || 0),
    0
  );

  const paidSales = sales.filter(
    (sale) => sale.paymentStatus === "Paid"
  ).length;

  const pendingSales = sales.filter(
    (sale) => sale.paymentStatus === "Pending"
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

  const handleNewSale = () => {
    navigate("/sales/new");
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
  };

  const closeSaleDetails = () => {
    setSelectedSale(null);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
  };

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
          TABLE CARD
      ===================================================== */}

      <div className="sales-table-card">

        <div className="sales-toolbar">

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


          <button
            type="button"
            className="filter-btn"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>


        {/* =====================================================
            SALES TABLE
            MOBILE = SEPARATE COLUMN
        ===================================================== */}

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>SALE ID</th>

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


                    {/* CUSTOMER ONLY */}

                    <td>

                      <div className="customer-cell">

                        <strong>
                          {sale.customer}
                        </strong>

                      </div>

                    </td>


                    {/* MOBILE - SEPARATE COLUMN */}

                    <td>

                      <div className="customer-cell">

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

                  <td colSpan="9">

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
          SALES = CLOSE ONLY
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

            {/* MODAL HEADER */}

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


            {/* CUSTOMER DETAILS */}

            <div className="sale-detail-grid">

              <div className="detail-box">

                <span>
                  Customer
                </span>

                <strong>
                  {selectedSale.customer}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Mobile
                </span>

                <strong>
                  {selectedSale.phone}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Sale Date
                </span>

                <strong>
                  {selectedSale.date}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Payment Method
                </span>

                <strong>
                  {selectedSale.paymentMethod}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  Payment Status
                </span>

                <span
                  className={`status-badge ${selectedSale.paymentStatus.toLowerCase()}`}
                >
                  {selectedSale.paymentStatus}
                </span>

              </div>

            </div>


            {/* SALE SUMMARY */}

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


            {/* CALCULATIONS */}

            <div className="sale-calculation">

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


            {/* SALES FOOTER - CLOSE ONLY */}

            <div className="sale-modal-footer">

              <button
                type="button"
                className="secondary-modal-btn"
                onClick={closeSaleDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Sales;