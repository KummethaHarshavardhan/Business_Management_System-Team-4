import axios from "axios";
import { getAuthHeaders, toError } from "./authHeader";

const API_URL = "http://localhost:5003/api/test-customers";

export const getCustomers = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch customers");
  }
};

export const getCustomerById = async (id) => {
  const customers = await getCustomers();
  return customers.find((customer) => String(customer._id) === String(id)) || null;
};
