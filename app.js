// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const productRoutes = require('./routes/productRoutes');
// const authRoutes = require('./routes/authRoutes');
// const connectDB = require('./config/db');
// const cartRoutes = require('./routes/cartRoutes');
// const farmerRoutes = require('./routes/farmerRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const initSocket = require('./socket/socket'); 
// const http = require('http');
// const socketIo = require('socket.io');



// dotenv.config();
// connectDB();
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });




// app.use(cors());
// app.use(express.json());

// app.use('/product', productRoutes);
// app.use('/', authRoutes);
// app.use('/cart', cartRoutes);
// app.use('/api', farmerRoutes);
// app.use('/api', messageRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const { initializeSocketIo } = require('./socket/initializeSocketIo');

// Load environment variables
dotenv.config();

// Connect to MongoDB (only here!)
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

// Start socket.io
initializeSocketIo(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
