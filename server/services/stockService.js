import mongoose from "mongoose";

export const getProduct = async (productId, token) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const product = await mongoose.connection.db
    .collection("testproducts")
    .findOne({ _id: new mongoose.Types.ObjectId(productId) });

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  return {
    _id: product._id,
    name: product.productName,
    price: product.sellingPrice,
    stock: product.stockQuantity,
  };
};

const adjustInventory = async (productId, quantity, operation, token) => {
  const adjustment =
    operation === "subtract" ? -quantity : quantity;

  const collection = mongoose.connection.db.collection("testproducts");
  const _id = new mongoose.Types.ObjectId(productId);

  const filter =
    operation === "subtract"
      ? { _id, stockQuantity: { $gte: quantity } }
      : { _id };

  const result = await collection.updateOne(filter, {
    $inc: { stockQuantity: adjustment },
  });

  if (result.matchedCount === 0) {
    if (operation === "subtract") {
      const exists = await collection.findOne({ _id }, { projection: { _id: 1 } });
      if (exists) {
        throw new Error(`Insufficient stock for product ${productId}`);
      }
    }
    throw new Error(`Product ${productId} not found`);
  }

  return true;
};

export const decreaseStock = (productId, quantity, token) =>
  adjustInventory(productId, quantity, "subtract", token);

export const increaseStock = (productId, quantity, token) =>
  adjustInventory(productId, quantity, "add", token);


export const getAllProducts = async () => {
  return mongoose.connection.db
    .collection("testproducts")
    .find({})
    .toArray();
};
