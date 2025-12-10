#!/bin/bash

# Script to initialize EC2 instance for blog deployment
# Run this script on your EC2 instance after setting it up

set -e

echo "=== Initializing EC2 instance for blog deployment ==="

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install PostgreSQL client (optional, for debugging)
echo "Installing PostgreSQL client..."
sudo yum install -y postgresql

# Install AWS CLI (if not already installed)
echo "Installing AWS CLI..."
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Create application directory
echo "Creating application directory..."
mkdir -p ~/blog-app
cd ~/blog-app

# Create docker-compose file for production
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: blog-postgres
    environment:
      POSTGRES_DB: blogdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - blog-network

  backend:
    image: ${BACKEND_IMAGE}
    container_name: blog-backend
    environment:
      PORT: 5000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: blogdb
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD:-changeme}
      HUGGINGFACE_API_KEY: ${HUGGINGFACE_API_KEY:-}
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - blog-network

  frontend:
    image: ${FRONTEND_IMAGE}
    container_name: blog-frontend
    ports:
      - "3000:3000"
    restart: unless-stopped
    networks:
      - blog-network

volumes:
  postgres_data:

networks:
  blog-network:
    driver: bridge
EOF

# Create environment file template
cat > .env.example << 'EOF'
# Database
DB_PASSWORD=your_secure_password_here

# AI API
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Docker Images (set these after CodeBuild pushes to ECR)
BACKEND_IMAGE=your_account_id.dkr.ecr.region.amazonaws.com/blog-backend:latest
FRONTEND_IMAGE=your_account_id.dkr.ecr.region.amazonaws.com/blog-frontend:latest
EOF

echo ""
echo "=== EC2 initialization complete ==="
echo ""
echo "Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Create .env file: cp .env.example .env"
echo "3. Edit .env with your values"
echo "4. Login to ECR: aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account_id>.dkr.ecr.<region>.amazonaws.com"
echo "5. Pull and run images: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "Note: You may need to log out and back in for Docker group changes to take effect."

