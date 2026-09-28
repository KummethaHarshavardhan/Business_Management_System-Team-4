// All Team 2 (Products / Inventory) calls live in THIS file only.
// When Team 2 shares their api, change only this file.

// Gets a product by id. Used for stock check, price and invoice productName.
// -- i want api/data/field from team2 - product by id: name, price, stock
export const getProduct = async (productId) => {
  // temporary placeholder until Team 2 api is ready
  return { _id: productId, name: 'PENDING TEAM 2 DATA', price: 0, stock: Infinity };
};

// Decreases stock after a sale (Lakshmi's Sales API will call this).
// -- i want api/data/field from team2 - api to DECREASE stock of a product by quantity
export const decreaseStock = async (productId, quantity) => {
  // temporary placeholder until Team 2 api is ready
  return true;
};

// Increases stock after a return.
// -- i want api/data/field from team2 - api to INCREASE stock of a product by quantity
export const increaseStock = async (productId, quantity) => {
  // temporary placeholder until Team 2 api is ready
  return true;
};
