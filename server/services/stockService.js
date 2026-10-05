
const PRODUCT_URL = 'http://localhost:5002/api/products'; 
const INVENTORY_ADJUST_URL ='http://localhost:5002/api/inventory/adjust'; 

export const getProduct = async (productId, token) => {
  if (!PRODUCT_URL) {
    return { _id: productId, name: 'PENDING TEAM 2 DATA', price: 0, stock: Infinity };
  }

  const res = await fetch(`${PRODUCT_URL}/${productId}`, {
    headers: token ? { Authorization: token } : {},
  });
  if (!res.ok) {
    throw new Error(`Product ${productId} not found (status ${res.status})`);
  }
  const p = await res.json(); // Team 2 returns the raw product doc, no { data: ... } wrapper

  return {
    _id: p._id,
    name: p.productName,
    price: p.sellingPrice,
    stock: p.stockQuantity,
  };
};

const adjustInventory = async (productId, quantity, operation, token) => {
  if (!INVENTORY_ADJUST_URL) {
    return true;
  }

  const res = await fetch(INVENTORY_ADJUST_URL, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },

    body: JSON.stringify({ productId, operation, adjustment: quantity }),
  });
  if (!res.ok) {
    throw new Error(`Failed to ${operation} stock for product ${productId} (status ${res.status})`);
  }
  return true;
};

export const decreaseStock = (productId, quantity, token) =>
  adjustInventory(productId, quantity, 'subtract', token);

export const increaseStock = (productId, quantity, token) =>
  adjustInventory(productId, quantity, 'add', token);

