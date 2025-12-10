#!/bin/bash

# Deployment script for EC2
# This script pulls the latest images from ECR and restarts the containers

set -e

echo "=== Starting deployment ==="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Login to ECR
echo "Logging in to ECR..."
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-}

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Error: AWS_ACCOUNT_ID not set in .env"
    exit 1
fi

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull latest images
echo "Pulling latest images..."
docker pull ${BACKEND_IMAGE:-$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/blog-backend:latest}
docker pull ${FRONTEND_IMAGE:-$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/blog-frontend:latest}

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start containers with new images
echo "Starting containers with new images..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check service status
echo "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=== Deployment complete ==="
echo "Backend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"

