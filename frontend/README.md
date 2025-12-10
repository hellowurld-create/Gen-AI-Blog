# Blog Frontend

React frontend for the auto-generated blog application.

## Features

- Modern React application with Vite
- Article listing page
- Article detail page with full content
- Responsive design
- Dockerized with Node.js

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
# Create .env file
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)

## Docker

Build and run with Docker:
```bash
docker build -t blog-frontend .
docker run -p 3000:3000 blog-frontend
```

The app will be available at http://localhost:3000

