const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS setup for development and production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    ...Array.from({ length: 256 }, (_, i) => `http://192.168.1.${i}:5173`),
    ...Array.from({ length: 256 }, (_, i) => `http://192.168.0.${i}:5173`)
];

// Add production frontend URL from environment variable
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// In production, allow all Vercel preview/production URLs
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // In production, allow any Vercel deployment
        if (isProduction && origin && origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // In development, be more lenient
        if (!isProduction) {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Enable credentials for auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/bands', require('./routes/bands'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/users', require('./routes/users'));
app.use('/api/shows', require('./routes/shows'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/posters', require('./routes/posters'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
