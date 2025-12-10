# Blog Backend API

Node.js/Express backend for the auto-generated blog application.

## Features

- RESTful API for articles (list, get by ID)
- PostgreSQL database integration
- AI-powered article generation using HuggingFace API
- Automatic daily article generation using node-cron
- Dockerized for easy deployment

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Make sure PostgreSQL is running and accessible

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `HUGGINGFACE_API_KEY`: HuggingFace API key (optional, will use fallback if not set)

## API Endpoints

- `GET /health` - Health check
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get a single article

## Docker

Build and run with Docker:
```bash
docker build -t blog-backend .
docker run -p 5000:5000 --env-file .env blog-backend
```

