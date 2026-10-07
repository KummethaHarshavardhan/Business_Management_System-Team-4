

const BUSINESS_SERVICE_URL = 'http://localhost:5000/api/business';

export const getBusinessDetails = async (token) => {
  const res = await fetch(BUSINESS_SERVICE_URL, {

     // at last integration remove comments for below line i mean 9 line remove comment 10 line give comments why means for testing now i give that    
    // headers: token ? { Authorization: token}` } : {},
    headers: token ? { Authorization: token } : {},
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
