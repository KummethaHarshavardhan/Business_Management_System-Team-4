import axios from "axios";
import { getAuthHeaders, toError } from "./authHeader";

// Team 4 server - existing testproducts collection (read-only)
const API_URL = "http://localhost:5003/api/test-products";

export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch products");
  }
};

export const getProductById = async (id) => {
  const products = await getProducts();
  return products.find((product) => String(product._id) === String(id)) || null;
};
