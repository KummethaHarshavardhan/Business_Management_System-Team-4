const API_URL = "http://localhost:5003/api/sales";

export const createSale = async (saleData, token) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(saleData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create sale");
  }
  return data;
};

export const getSales = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch sales");
  }
  return await response.json();
};

export const getSaleById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch sale");
  }
  return await response.json();
};
