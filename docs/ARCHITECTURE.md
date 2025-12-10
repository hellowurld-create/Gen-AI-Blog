<!-- @format -->

# Architecture Documentation

## Overview

This is a full-stack application that auto-generates blog articles. it was built with React, Node.js, PostgreSQL, Docker, and AWS services.

## System Architecture

```
┌─────────────────┐
│   React App     │  (Frontend - Port 3000)
│   (Node.js)     │
└────────┬────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│  Node.js API    │  (Backend - Port 5000)
│  (Express)      │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │  (Database - Port 5432)
└─────────────────┘
```

## Components

### Frontend (React)

- **Technology**: React 18 with Vite
- **Container**: Node.js with serve (production)
- **App Features**:
  - Article listing page
  - Article detail page
  - Responsive design
  - API integration

### Backend (Node.js)

- **Technology**: Node.js with Express
- **Features**:
  - RESTful API endpoints
  - PostgreSQL database integration
  - AI article generation (HuggingFace API)
  - Scheduled daily article generation (node-cron)
  - CORS enabled for frontend communication

### Database (PostgreSQL)

- **Schema**: Simple articles table
- **Fields**: id, title, content, created_at, updated_at
- **Initialization**: Auto-creates table and generates 3 initial articles if needed

### AI Integration

- **Service**: HuggingFace Inference API (free tier)
- **Model**: GPT-2 (configurable)
- **Fallback**: Generates template articles if API is unavailable
- **Scheduling**: Daily at 2:00 AM UTC

## Deployment Architecture

### AWS Services

1. **EC2 Instance**

   - Hosts all Docker containers
   - Single instance deployment
   - Public IP for access

2. **ECR (Elastic Container Registry)**

   - Stores Docker images for backend and frontend
   - Separate repositories for each service

3. **CodeBuild**
   - Automated CI/CD pipeline
   - Builds Docker images on code push
   - Pushes images to ECR

### Deployment Flow

```
GitHub Push
    │
    ▼
CodeBuild Triggered
    │
    ├─► Build Backend Image
    ├─► Build Frontend Image
    │
    ▼
Push to ECR
    │
    ▼
EC2 Pulls Latest Images
    │
    ▼
Docker Compose Restarts Services
    │
    ▼
Application Live
```

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)

### Running Locally

1. **With Docker Compose** (Recommended):

```bash
docker-compose up -d
```

2. **Manual Setup**:
   - Start PostgreSQL
   - Run backend: `cd backend && npm install && npm start`
   - Run frontend: `cd frontend && npm install && npm run dev`

## Environment Variables

### Backend

- `PORT`: Server port (default: 5000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `HUGGINGFACE_API_KEY`: HuggingFace API key (optional)

### Frontend

- `VITE_API_URL`: Backend API URL

## Security Considerations

1. **Database**: Use strong passwords in production
2. **API Keys**: Store in environment variables, never commit
3. **CORS**: Configured for frontend domain
4. **Firewall**: Configure EC2 security groups appropriately

## Scaling Considerations

Current architecture is designed for single-instance deployment. For scaling:

1. **Database**: Consider RDS for managed PostgreSQL
2. **Load Balancing**: Add ALB for multiple EC2 instances
3. **Caching**: Add Redis for article caching
4. **CDN**: Use CloudFront for frontend assets

## Monitoring

Recommended additions:

- CloudWatch logs for containers
- Health check endpoints
- Database connection monitoring
- Article generation success/failure tracking

## Future Improvements

1. User authentication and comments
2. Article categories and tags
3. Search functionality
4. Image generation for articles
5. Automated testing (unit, integration, e2e)
6. CI/CD improvements (automated EC2 deployment)
7. Database migrations system
8. Rate limiting and API security
