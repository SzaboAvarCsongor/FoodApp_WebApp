import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import restaurantRoutes from './routes/restaurantRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

app.use('/api/restaurants', restaurantRoutes);

app.get('/', (req, res) => {
  res.send('Food Delivery API is running...');
});

app.use((err, req, res, next) => {
  console.error('Szerver hiba:', err.stack);
  res.status(500).json({ error: 'Valami elromlott a szerveren!' });
});

app.listen(PORT, () => {
  console.log(`A backend szerver fut a http://localhost:${PORT} címen`);
});