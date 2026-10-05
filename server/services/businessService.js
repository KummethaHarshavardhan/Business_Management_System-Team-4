

const BUSINESS_SERVICE_URL = 'http://localhost:5000/api/business';

export const getBusinessDetails = async (token) => {
  const res = await fetch(BUSINESS_SERVICE_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch business details from Team 1 (status ${res.status})`);
  }

  const json = await res.json();
  const b = json.data;

  return {
    name: b.businessName,
    address: b.address,
    gstin: b.gstNumber,
    phone: b.phone,
  };
};
