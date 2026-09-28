import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Invoices.css';

const defaultInvoices = [
  {
    id: 'INV-0001',
    customer: 'Walk-in Customer',
    phone: '9876543210',
    date: '28 Sep 2026',
    items: [
      {
        productName: 'Monitor',
        quantity: 1,
        price: 12500,
        total: 12500,
      },
    ],
    subtotal: 12500,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 12500,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  },
  {
    id: 'INV-0002',
    customer: 'Rahul Kumar',
    phone: '9123456780',
    date: '27 Sep 2026',
    items: [
      {
        productName: 'Wireless Keyboard',
        quantity: 2,
        price: 1500,
        total: 3000,
      },
      {
        productName: 'USB Mouse',
        quantity: 1,
        price: 800,
        total: 800,
      },
    ],
    subtotal: 3800,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 3800,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
  },
  {
    id: 'INV-0003',
    customer: 'Priya Sharma',
    phone: '9988776655',
    date: '26 Sep 2026',
    items: [
      {
        productName: 'Laptop Stand',
        quantity: 2,
        price: 2200,
        total: 4400,
      },
    ],
    subtotal: 4400,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 4400,
    paymentMethod: 'Credit',
    paymentStatus: 'Pending',
  },
];

function Invoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  useEffect(() => {
    const savedInvoices = JSON.parse(
      localStorage.getItem('invoices') || '[]'
    );

    if (savedInvoices.length > 0) {
      setInvoices([
        ...defaultInvoices,
        ...savedInvoices,
      ]);
    } else {
      setInvoices(defaultInvoices);
    }
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        invoice.id
          .toLowerCase()
          .includes(searchText) ||
        invoice.customer
          .toLowerCase()
          .includes(searchText) ||
        invoice.phone.includes(searchText);

      const matchesStatus =
        status === 'All' ||
        invoice.paymentStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, status]);

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.grandTotal || invoice.amount || 0),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === 'Paid'
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === 'Pending'
  ).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  return (
    <div className="invoices-page">

      {/* Header */}
      <div className="invoices-header">

        <div>
          <h1>Invoices</h1>

          <p>
            View and manage all generated invoices.
          </p>
        </div>

        <button
          className="invoice-primary-btn"
          onClick={() =>
            navigate('/invoices/new')
          }
        >
          + New Invoice
        </button>

      </div>

      {/* Summary */}
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

      {/* Table */}
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

          <button className="filter-btn">
            Filter
          </button>

        </div>

        <div className="invoice-table-wrapper">

          <table className="invoice-table">

            <thead>

              <tr>
                <th>INVOICE</th>
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

              {filteredInvoices.length > 0 ? (

                filteredInvoices.map((invoice) => (

                  <tr key={invoice.id}>

                    <td>
                      <div className="invoice-number">
                        {invoice.id}
                      </div>
                    </td>

                    <td>

                      <div className="customer-info">

                        <strong>
                          {invoice.customer}
                        </strong>

                        <span>
                          {invoice.phone}
                        </span>

                      </div>

                    </td>

                    <td>
                      {invoice.date}
                    </td>

                    <td>
                      {Array.isArray(invoice.items)
                        ? invoice.items.length
                        : invoice.items || 0}
                    </td>

                    <td>

                      <strong>
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
                        className={`payment-badge ${invoice.paymentStatus.toLowerCase()}`}
                      >
                        {invoice.paymentStatus}
                      </span>

                    </td>

                    <td>

                      <button
                        className="view-invoice-btn"
                        onClick={() =>
                          setSelectedInvoice(invoice)
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

                    <div className="empty-invoices">

                      <div className="empty-icon">
                        ▤
                      </div>

                      <h3>
                        No invoices found
                      </h3>

                      <p>
                        Try changing your search or filter.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (

        <div
          className="invoice-modal-overlay"
          onClick={() =>
            setSelectedInvoice(null)
          }
        >

          <div
            className="invoice-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Invoice Details
                </h2>

                <p>
                  {selectedInvoice.id}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedInvoice(null)
                }
              >
                ×
              </button>

            </div>

            <div className="invoice-preview">

              {/* Business */}
              <div className="business-section">

                <div>

                  <h2>
                    BillPro
                  </h2>

                  <p>
                    Billing Management System
                  </p>

                  <p>
                    Hyderabad, Telangana
                  </p>

                  <p>
                    GSTIN: 36ABCDE1234F1Z5
                  </p>

                </div>

                <div className="invoice-title">

                  <h1>
                    INVOICE
                  </h1>

                  <strong>
                    {selectedInvoice.id}
                  </strong>

                  <span>
                    {selectedInvoice.date}
                  </span>

                </div>

              </div>

              <div className="invoice-divider"></div>

              {/* Customer */}
              <div className="customer-section">

                <div>

                  <span>
                    Bill To
                  </span>

                  <strong>
                    {selectedInvoice.customer}
                  </strong>

                  <p>
                    {selectedInvoice.phone}
                  </p>

                </div>

                <div>

                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {selectedInvoice.paymentMethod}
                  </strong>

                </div>

                <div>

                  <span>
                    Payment Status
                  </span>

                  <strong className="modal-status">
                    {selectedInvoice.paymentStatus}
                  </strong>

                </div>

              </div>

              {/* Items */}
              <div className="invoice-items">

                <div className="invoice-item-header">

                  <span>
                    Product
                  </span>

                  <span>
                    Qty
                  </span>

                  <span>
                    Price
                  </span>

                  <span>
                    Total
                  </span>

                </div>

                {Array.isArray(
                  selectedInvoice.items
                ) &&
                  selectedInvoice.items.map(
                    (item, index) => (

                      <div
                        className="invoice-item-row"
                        key={`${item.productName}-${index}`}
                      >

                        <span>
                          {item.productName}
                        </span>

                        <span>
                          {item.quantity}
                        </span>

                        <span>
                          {formatCurrency(
                            item.price
                          )}
                        </span>

                        <strong>
                          {formatCurrency(
                            item.total
                          )}
                        </strong>

                      </div>

                    )
                  )}

              </div>

              {/* Totals */}
              <div className="invoice-total-section">

                <div>

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedInvoice.subtotal ??
                        selectedInvoice.grandTotal
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Discount
                  </span>

                  <strong>
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

                <div className="grand-total">

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

            </div>

            <div className="modal-actions">

              <button
                className="secondary-btn"
                onClick={() =>
                  window.print()
                }
              >
                Print Invoice
              </button>

              <button
                className="invoice-primary-btn"
                onClick={() =>
                  window.print()
                }
              >
                Download / Print PDF
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Invoices;