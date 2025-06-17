const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();
connectDB();




const app = express();
app.use(cors());
app.use(express.json());

app.use('/product', productRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
