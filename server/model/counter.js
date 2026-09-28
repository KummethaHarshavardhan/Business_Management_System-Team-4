import mongoose, { Schema } from 'mongoose';

// Invoice number ki counter. Oka document: { name: 'invoice', seq: 5 }
const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model('Counter', counterSchema);
