import axios from "axios";
import { getAuthHeaders, toError } from "./authHeader";

// Team 4 - Invoices
const API_URL = "http://localhost:5003/api/invoices";

export const createInvoice = async (invoiceData, token) => {
  try {
    const response = await axios.post(API_URL, invoiceData, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to create invoice");
  }
};

export const getInvoices = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch invoices");
  }
};

export const getInvoiceById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch invoice");
  }
};


export const updateInvoicePaymentStatus = async (id, paymentStatus, paidAmount) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/payment-status`,
      { paymentStatus, paidAmount },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw toError(error, 'Failed to update invoice payment status');
  }
};
