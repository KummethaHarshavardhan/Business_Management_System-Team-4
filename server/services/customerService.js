import mongoose from "mongoose";

const CUSTOMER_URL = "http://localhost:5007/api/customers";

const customersCollection = "customers";

export const getCustomer = async (customerId, token) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  // it is for temporary beacuse we taet for apis
  const customer = await mongoose.connection.db
    .collection(customersCollection)
    .findOne({ _id: new mongoose.Types.ObjectId(customerId) });

  if (!customer) {
    throw new Error(`Customer ${customerId} not found`);
  }

  return {
    _id: customer._id,
    name: customer.name,
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
    gstNumber: customer.gstNumber || "",
  };
};

export const getAllCustomers = async () => {
  return mongoose.connection.db
    .collection(customersCollection)
    .find({})
    .toArray();
};