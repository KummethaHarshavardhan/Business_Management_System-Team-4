const API_URL = "http://localhost:5003/api/invoices";

export const createInvoice = async (invoiceData, token) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(invoiceData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create invoice");
  }
  return data;
};

export const getInvoices = async () => {
  const response = await fetch(API_URL);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch invoices");
  }

  return data;
};

export const getInvoiceById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch invoice");
  }

  return data;
};