import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import returnRoutes from './routes/returnRoutes.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/invoices', invoiceRoutes);
app.use('/api/returns', returnRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', module: 'team4-sales-billing' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Team 4 server running on port ${PORT}`);
});
