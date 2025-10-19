import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import patientRoutes from './routes/patients.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import inventoryRoutes from './routes/inventory.js';
import billingRoutes from './routes/billing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.delete('/api/images/:id', async (req, res, next) => {
  req.url = `/images/${req.params.id}`;
  patientRoutes(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SAVISER API is running' });
});

app.listen(PORT, () => {
  console.log(`SAVISER Server running on port ${PORT}`);
});
