const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const { initializeSocketIo } = require('./socket/initializeSocketIo');


dotenv.config();


connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/product', require('./routes/productRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/api', require('./routes/farmerRoutes'));
app.use('/api', require('./routes/messageRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

initializeSocketIo(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
