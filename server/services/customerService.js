
const CUSTOMER_URL ="http://localhost:5007/api/customers";

export const getCustomer = async (customerId, token) => {
  if (!CUSTOMER_URL) {
    throw new Error(
      "TEAM3_CUSTOMER_URL is not configured. Please add Team 3 Customer API URL in .env"
    );
  }

  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = token;
    }

    const response = await fetch(`${CUSTOMER_URL}/${customerId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Customer ${customerId} not found`);
      }

      throw new Error(
        `Failed to fetch customer ${customerId} from Team 3 (status ${response.status})`
      );
    }

    const json = await response.json();

    const customer = json.data ?? json;

    if (!customer) {
      throw new Error(`Customer ${customerId} data not found`);
    }

    return {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      gstNumber: customer.gstNumber || "",
    };
  } catch (error) {
    console.error("Team 3 Customer API Error:", error.message);
    throw error;
  }
};