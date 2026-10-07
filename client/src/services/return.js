import axios from "axios";
import { getAuthHeaders, toError } from "./authHeader";

// Team 4 - Returns
const API_URL = "http://localhost:5003/api/returns";

export const createReturn = async (returnData, token) => {
  try {
    const response = await axios.post(API_URL, returnData, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to create return");
  }
};

export const getReturns = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw toError(error, "Failed to fetch returns");
  }
};
