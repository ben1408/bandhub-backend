const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}

const app = express();

// CORS setup for development and production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
];

// Only add local network IPs in development
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
        ...Array.from({ length: 256 }, (_, i) => `http://192.168.1.${i}:5173`),
        ...Array.from({ length: 256 }, (_, i) => `http://192.168.0.${i}:5173`)
    );
}

// Add production frontend URL from environment variable
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// In production, allow all Vercel preview/production URLs
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        // In production, allow any Vercel deployment
        if (isProduction && origin && origin.includes('.vercel.app')) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // In development, be more lenient but log unknown origins
        if (!isProduction) {
            console.warn(`Unknown origin allowed in development: ${origin}`);
            return callback(null, true);
        }

        console.error(`CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Enable credentials for auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Security middleware
app.use(helmet()); // Adds security headers

// FIXED: Express 5.x compatibility - use replaceWith option
app.use(mongoSanitize({
    replaceWith: '_'  // Replace prohibited characters with underscore instead of modifying query object
})); // Prevent NoSQL injection

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/', limiter); // Apply to all API routes
app.use('/api/users/login', authLimiter); // Stricter limit for login
app.use('/api/users/register', authLimiter); // Stricter limit for registration

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit request body size

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
