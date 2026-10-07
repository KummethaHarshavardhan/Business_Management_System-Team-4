import axios from "axios";
import { getAuthHeaders, toError } from "./authHeader";

// Team 4 - Sales
const API_URL = "http://localhost:5003/api/sales";

export const createSale = async (saleData, token) => {
  try {
    const response = await axios.post(API_URL, saleData, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to create sale");
  }
};

export const getSales = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch sales");
  }
};

export const getSaleById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch sale");
  }
};
