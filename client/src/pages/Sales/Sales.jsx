import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Sales.css";
import { getSales } from "../../services/sales";
import { getCustomers } from "../../services/customer";

function Sales() {
  const navigate = useNavigate();

  const [sales,setSales] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await getSales();
        const salesData = Array.isArray(data) ? data : data.data || [];

        // Customer name/phone for the existing UI (sale only stores the customer id)
        let customerMap = {};
        try {
          const customerResponse = await getCustomers();
          const customerList = Array.isArray(customerResponse)
            ? customerResponse
            : customerResponse.data || [];
          customerMap = Object.fromEntries(
            customerList.map((c) => [String(c._id || c.id), c])
          );
        } catch (customerError) {
          console.error("Customer lookup error:", customerError);
        }

        // Map the Team 4 API sale document to the shape this page already renders
        const formattedSales = salesData.map((sale) => {
          const customerId = String(
            sale.customer?._id || sale.customer || ""
          );
          const customer = customerMap[customerId];
          const subtotal = Number(sale.subtotal || 0);
          const discountValue = Number(sale.discount?.value || 0);
          const discountAmount =
            sale.discount?.type === "percentage"
              ? (subtotal * discountValue) / 100
              : discountValue;

          return {
            ...sale,
            id: sale._id
              ? `SALE-${String(sale._id).slice(-6).toUpperCase()}`
              : sale.id,
            customer: customer?.name || customerId,
            phone: customer?.phone || "",
            date: sale.createdAt
              ? new Date(sale.createdAt).toLocaleDateString("en-IN")
              : "",
            items: Array.isArray(sale.items)
              ? sale.items.length
              : Number(sale.items || 0),
            amount: Number(sale.grandTotal ?? sale.amount ?? 0),
            tax: Number(sale.tax || 0),
            discount: discountAmount,
          };
        });

        setSales(formattedSales);
      } catch (error) {
        console.error("Sales API Error:", error);
      }
    };

    fetchSales();
    }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        String(sale.id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(sale.customer || "")
          .toLowerCase()
          .includes(searchText) ||
        String(sale.phone || "").includes(searchText);

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


                    <td>

                      <div className="customer-cell">

                        <strong>
                          {sale.customer}
                        </strong>

                      </div>

                    </td>


                    <td>

                      <div className="customer-cell">

                        <span>
                          {sale.phone}
                        </span>

                      </div>

                    </td>


                    <td>
                      {sale.date}
                    </td>


                    <td>

                      <span className="item-badge">
                        {sale.items}
                      </span>

                    </td>


                    <td>

                      <strong className="amount">
                        {formatCurrency(
                          sale.amount
                        )}
                      </strong>

                    </td>


                    <td>
                      {sale.paymentMethod}
                    </td>


                    <td>

                      <span
                        className={`status-badge ${String(
                          sale.paymentStatus || ""
                        ).toLowerCase()}`}
                      >
                        {sale.paymentStatus}
                      </span>

                    </td>


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
                  className={`status-badge ${String(
                    selectedSale.paymentStatus || ""
                  ).toLowerCase()}`}
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


            {/* SALES FOOTER */}

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