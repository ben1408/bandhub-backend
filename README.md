# BandHub Backend API

Backend API for the BandHub music platform.

## Tech Stack
- Node.js + Express
- MongoDB Atlas
- JWT Authentication

## Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```
PORT=5050
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
FRONTEND_URL=your_frontend_url
OPENAI_API_KEY=your_openai_key (optional)
```

## Local Development

```bash
npm install
npm run dev
```

## Deployment to Render

1. Push this repository to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

## API Endpoints

- `/api/bands` - Band management
- `/api/venues` - Venue management
- `/api/shows` - Show/concert management
- `/api/users` - User authentication and management
- `/api/articles` - Article management
- `/api/posters` - Poster generation
- `/api/analytics` - Analytics data
