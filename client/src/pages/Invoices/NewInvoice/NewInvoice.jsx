import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Invoices.css';
import './NewInvoice.css';
import { createInvoice, getInvoices } from '../../../services/invoice';
import { getSales } from '../../../services/sales';

function NewInvoice() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInvoice, setSuccessInvoice] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [salesResponse, invoicesResponse] = await Promise.all([
        getSales(),
        getInvoices(),
      ]);
      const salesData = Array.isArray(salesResponse)
        ? salesResponse
        : salesResponse?.data || [];
      const invoicesData = Array.isArray(invoicesResponse)
        ? invoicesResponse
        : invoicesResponse?.data || [];
      setSales(salesData);
      setInvoices(invoicesData);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load sales and invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const invoicedSaleIds = useMemo(
    () => new Set(invoices.map((invoice) => String(invoice.sale?._id || invoice.sale || ''))),
    [invoices]
  );

  const availableSales = useMemo(
    () => sales.filter((sale) => !invoicedSaleIds.has(String(sale._id || sale.id))),
    [sales, invoicedSaleIds]
  );

  const selectedSale = availableSales.find(
    (sale) => String(sale._id || sale.id) === String(selectedSaleId)
  );

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleGenerateInvoice = async () => {
    if (!selectedSaleId) {
      setErrorMessage('Please select a sale ID first.');
      return;
    }

    // Avoid generating from a stale selection if the sale was invoiced elsewhere.
    if (invoicedSaleIds.has(String(selectedSaleId))) {
      setErrorMessage('An invoice already exists for this sale. Refresh the list and select another sale.');
      return;
    }

    setGenerating(true);
    setErrorMessage('');
    setSuccessInvoice(null);
    try {
      const invoice = await createInvoice({ saleId: selectedSaleId });
      setInvoices((previous) => [invoice, ...previous]);
      setSelectedSaleId('');
      setSuccessInvoice(invoice);
    } catch (error) {
      // A conflict may mean another user generated the invoice at the same time.
      setErrorMessage(error.message || 'Invoice generation failed. Please try again.');
      await loadData();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="new-invoice-page">
      <div className="new-invoice-header">
        <div>
          <h1>New Invoice</h1>
          <p>Select an existing sale and generate its invoice.</p>
        </div>
        <button className="back-btn" type="button" onClick={() => navigate('/invoices')}>
          ← Back to Invoices
        </button>
      </div>

      <section className="invoice-form-card sale-invoice-card">
        <div className="card-title">
          <h2>Select Sale ID</h2>
          <p>Only sales without an existing invoice are listed here.</p>
        </div>

        <div className="sale-invoice-selection">
          <div className="form-group">
            <label htmlFor="saleId">Sale ID *</label>
            <select
              id="saleId"
              value={selectedSaleId}
              onChange={(event) => {
                setSelectedSaleId(event.target.value);
                setErrorMessage('');
                setSuccessInvoice(null);
              }}
              disabled={loading || generating || availableSales.length === 0}
            >
              <option value="">{loading ? 'Loading sales...' : 'Select Sale ID'}</option>
              {availableSales.map((sale) => {
                const id = String(sale._id || sale.id);
                const date = sale.createdAt
                  ? new Date(sale.createdAt).toLocaleDateString('en-IN')
                  : 'Date unavailable';
                return (
                  <option key={id} value={id}>
                    {id} — {date} — {formatCurrency(sale.grandTotal)}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            className="invoice-primary-btn generate-sale-invoice-btn"
            onClick={handleGenerateInvoice}
            disabled={loading || generating || !selectedSaleId}
          >
            {generating ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>

        {selectedSale && (
          <div className="selected-sale-summary">
            <div><span>Sale ID</span><strong>{selectedSale._id || selectedSale.id}</strong></div>
            <div><span>Sale Date</span><strong>{selectedSale.createdAt ? new Date(selectedSale.createdAt).toLocaleString('en-IN') : '—'}</strong></div>
            <div><span>Items</span><strong>{Array.isArray(selectedSale.items) ? selectedSale.items.length : 0}</strong></div>
            <div><span>Grand Total</span><strong>{formatCurrency(selectedSale.grandTotal)}</strong></div>
            <div><span>Payment Status</span><strong>{selectedSale.paymentStatus || '—'}</strong></div>
          </div>
        )}

        {errorMessage && <div className="sale-invoice-message error" role="alert">{errorMessage}</div>}
        {successInvoice && (
          <div className="sale-invoice-message success" role="status">
            Invoice <strong>{successInvoice.invoiceNumber}</strong> generated successfully. This Sale ID has been removed from the selection list.
          </div>
        )}

        {!loading && availableSales.length === 0 && !successInvoice && (
          <div className="sale-invoice-empty">
            There are no sales waiting for an invoice. Once a new sale is created, it will appear here.
          </div>
        )}

        <button type="button" className="sale-invoice-refresh-btn" onClick={loadData} disabled={loading || generating}>
          Refresh Sales List
        </button>
      </section>
    </div>
  );
}

export default NewInvoice;