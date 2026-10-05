const API_URL = "http://localhost:5003/api/returns";

export const createReturn = async (returnData, token) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(returnData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create return");
  }

  return data;
};

export const getReturns = async () => {
  const response = await fetch(API_URL);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch returns");
  }

  return data;
};