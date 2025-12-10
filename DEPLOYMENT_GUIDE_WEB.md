# 🚀 Deployment Guide - Using AWS Web Console

This guide walks you through deploying your blog application using **only the AWS Web Console** (no command line required).

---

## 📋 Prerequisites

Before starting:
- ✅ AWS Account (free tier eligible)
- ✅ GitHub account with your code repository
- ✅ HuggingFace API key (optional but recommended)
- ✅ Basic understanding of AWS services

---

## Phase 1: Get Your AWS Account Information

### Step 1.1: Find Your AWS Account ID

1. **Go to AWS Console:** https://console.aws.amazon.com
2. **Click on your account name** (top right)
3. **Your Account ID** is displayed in the dropdown menu
4. **Write it down** - you'll need it later (format: 12-digit number)

### Step 1.2: Note Your Region

1. **Look at the top right** of the AWS Console
2. **Click the region dropdown** (e.g., "N. Virginia" = us-east-1)
3. **Choose your region** (recommended: `us-east-1` for free tier)
4. **Write it down** - you'll need it later

---

## Phase 2: Create ECR Repositories (Docker Image Storage)

### Step 2.1: Create Backend Repository

1. **Go to ECR Console:**
   - Search for "ECR" in the AWS search bar
   - Click "Elastic Container Registry"

2. **Create Repository:**
   - Click **"Create repository"** button
   - **Repository name:** `blog-backend`
   - **Tag immutability:** Leave default (disabled)
   - **Scan on push:** ✅ **Enable** (for security)
   - **Encryption:** Leave default
   - Click **"Create repository"**

3. **Note the Repository URI:**
   - After creation, you'll see: `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/blog-backend`
   - **Copy this URI** - you'll need it later

### Step 2.2: Create Frontend Repository

1. **Click "Create repository"** again
2. **Repository name:** `blog-frontend`
3. **Tag immutability:** Leave default
4. **Scan on push:** ✅ **Enable**
5. Click **"Create repository"**

6. **Note the Repository URI:**
   - Copy: `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/blog-frontend`
   - **Save both URIs** for later

---

## Phase 3: Create EC2 Instance

### Step 3.1: Launch EC2 Instance

1. **Go to EC2 Console:**
   - Search for "EC2" in AWS search bar
   - Click "EC2"

2. **Launch Instance:**
   - Click **"Launch instance"** button
   - Click **"Launch instance"** again

3. **Name and tags:**
   - **Name:** `blog-app-server`

4. **Application and OS Images:**
   - **AMI:** Amazon Linux 2023 (free tier eligible)
   - Should be pre-selected

5. **Instance type:**
   - Select **t2.micro** (free tier eligible)
   - Should be pre-selected

6. **Key pair (login):**
   - Click **"Create new key pair"**
   - **Key pair name:** `blog-app-key`
   - **Key pair type:** RSA
   - **Private key file format:** `.pem` (for Mac/Linux) or `.ppk` (for Windows PuTTY)
   - Click **"Create key pair"**
   - **⚠️ IMPORTANT:** The `.pem` file will download automatically - **save it securely!**

7. **Network settings:**
   - Click **"Edit"** to configure security group
   - **Security group name:** `blog-app-sg`
   - **Description:** `Security group for blog application`

8. **Add Security Group Rules:**
   
   **Rule 1 - SSH:**
   - Click **"Add security group rule"**
   - **Type:** SSH
   - **Port:** 22
   - **Source type:** My IP (or Custom, then enter your IP)
   - **Description:** `SSH access`

   **Rule 2 - Frontend:**
   - Click **"Add security group rule"**
   - **Type:** Custom TCP
   - **Port:** 3000
   - **Source type:** Anywhere-IPv4 (0.0.0.0/0)
   - **Description:** `Frontend access`

   **Rule 3 - Backend:**
   - Click **"Add security group rule"**
   - **Type:** Custom TCP
   - **Port:** 5000
   - **Source type:** Anywhere-IPv4 (0.0.0.0/0)
   - **Description:** `Backend API access`

9. **Configure storage:**
   - Leave default (8 GB gp3, free tier eligible)

10. **Launch Instance:**
    - Click **"Launch instance"** button
    - Wait for instance to be created
    - Click **"View all instances"**

### Step 3.2: Get EC2 Public IP

1. **In EC2 Console:**
   - Find your instance `blog-app-server`
   - Wait for **"Instance state"** to show **"Running"** (green)
   - **Copy the "Public IPv4 address"** - you'll need it for SSH

### Step 3.3: Connect to EC2 Instance

**Option A: Using AWS Systems Manager (Easiest - No SSH Key Needed)**

1. **In EC2 Console:**
   - Select your instance
   - Click **"Connect"** button
   - Select **"Session Manager"** tab
   - Click **"Connect"**
   - A browser-based terminal will open

**Option B: Using SSH (Traditional Method)**

**For Windows (using PuTTY):**
1. Download PuTTY: https://www.putty.org/
2. Convert `.pem` to `.ppk` using PuTTYgen
3. Open PuTTY
4. Host name: `ec2-user@YOUR_EC2_PUBLIC_IP`
5. Connection → SSH → Auth → Browse → Select your `.ppk` file
6. Click "Open"

**For Mac/Linux:**
```bash
chmod 400 blog-app-key.pem
ssh -i blog-app-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### Step 3.4: Install Required Software on EC2

Once connected to EC2, run these commands:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Create application directory
mkdir -p ~/blog-app
cd ~/blog-app
```

**Log out and back in** for Docker group changes to take effect:
```bash
exit
# Then reconnect using the same method
```

### Step 3.5: Configure AWS CLI on EC2

1. **Get AWS Credentials:**
   - Go to AWS Console → IAM (search "IAM")
   - Click **"Users"** → Your username
   - Click **"Security credentials"** tab
   - Click **"Create access key"**
   - Select **"Command Line Interface (CLI)"**
   - Check the confirmation box
   - Click **"Next"**
   - Click **"Create access key"**
   - **⚠️ IMPORTANT:** Copy both:
     - **Access key ID**
     - **Secret access key** (only shown once!)

2. **On EC2, configure AWS CLI:**
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your region (e.g., us-east-1)
# Enter output format: json
```

### Step 3.6: Create Production Files on EC2

**Create docker-compose.prod.yml:**

```bash
cd ~/blog-app
nano docker-compose.prod.yml
```

**Paste this content:**

```yaml
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
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Create .env file:**

```bash
nano .env
```

**Paste this (replace with your actual values):**

```env
# Database Password (choose a strong password)
DB_PASSWORD=your_secure_password_here

# HuggingFace API Key (get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=hf_your_token_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your_12_digit_account_id

# Docker Images (from ECR - replace with your actual URIs)
BACKEND_IMAGE=your_account_id.dkr.ecr.us-east-1.amazonaws.com/blog-backend:latest
FRONTEND_IMAGE=your_account_id.dkr.ecr.us-east-1.amazonaws.com/blog-frontend:latest
```

**Replace:**
- `your_secure_password_here` with a strong password
- `hf_your_token_here` with your HuggingFace API token (or leave empty)
- `your_12_digit_account_id` with your AWS Account ID
- `your_account_id.dkr.ecr.us-east-1.amazonaws.com` with your actual ECR URIs

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Phase 4: Setup CodeBuild (Automated Builds)

### Step 4.1: Create CodeBuild Project

1. **Go to CodeBuild Console:**
   - Search for "CodeBuild" in AWS search bar
   - Click "CodeBuild"

2. **Create Build Project:**
   - Click **"Create build project"** button

3. **Project Configuration:**
   - **Project name:** `blog-build`
   - **Description:** `Build and push Docker images for blog app`

4. **Source:**
   - **Source provider:** GitHub
   - Click **"Connect to GitHub"** (first time only)
   - Authorize AWS to access GitHub
   - **Repository:** Select your repository
   - **Branch:** `main` (or your default branch)

5. **Environment:**
   - **Environment image:** Managed image
   - **Operating system:** Amazon Linux 2
   - **Runtime(s):** Standard
   - **Image:** `aws/codebuild/standard:5.0`
   - **Image version:** Always use the latest
   - **Privileged:** ✅ **Yes** (required for Docker)

6. **Buildspec:**
   - **Buildspec name:** `infra/buildspec.yml`
   - (This should already be in your repository)

7. **Service Role:**
   - **Service role:** New service role
   - **Role name:** `CodeBuildServiceRole-blog-build`
   - CodeBuild will automatically create this with basic permissions
   - **⚠️ IMPORTANT:** After creating the project, you MUST add ECR permissions manually (see Step 4.2 below)
   - **⚠️ NOTE:** You'll also need to add CodeConnections permissions if using GitHub connection

8. **Environment Variables:**
   - Click **"Add environment variable"**
   - **Name:** `AWS_ACCOUNT_ID`
   - **Value:** Your 12-digit AWS Account ID
   - Click **"Add environment variable"** again
   - **Name:** `AWS_DEFAULT_REGION`
   - **Value:** Your region (e.g., `us-east-1`)

9. **Create Project:**
   - Click **"Create build project"** button

### Step 4.2: Add Required Permissions to CodeBuild Service Role

**⚠️ THIS STEP IS CRITICAL - Don't skip it!**

1. **Go to IAM Console:**
   - Search for "IAM" in AWS search bar
   - Click "IAM"

2. **Find Service Role:**
   - Click **"Roles"**
   - Search for `CodeBuildServiceRole-blog-build`
   - Click on the role

3. **Add ECR Full Access (Required for Docker images):**
   - Click **"Add permissions"** → **"Attach policies"**
   - In the search box, type: `AmazonEC2ContainerRegistryFullAccess`
   - ✅ Check the box next to `AmazonEC2ContainerRegistryFullAccess`
   - Click **"Add permissions"**
   
   **OR create a custom policy (more secure, recommended):**
   - Click **"Add permissions"** → **"Create inline policy"**
   - Click **"JSON"** tab
   - Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload"
            ],
            "Resource": "*"
        }
    ]
}
```

   - Click **"Next"**
   - **Policy name:** `CodeBuild-ECR-Access`
   - Click **"Create policy"**

4. **Add CodeConnections Permission (Required for GitHub):**
   - Click **"Add permissions"** → **"Create inline policy"**
   - Click **"JSON"** tab
   - Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "codeconnections:UseConnection"
            ],
            "Resource": "arn:aws:codeconnections:*:*:connection/*"
        }
    ]
}
```

   - **Note:** Using `*` allows all connections (allows future connections without reconfiguring)
   - Click **"Next"**
   - **Policy name:** `CodeBuild-CodeConnections-Access`
   - Click **"Create policy"**

5. **Verify All Permissions:**
   - Go back to the role's **"Permissions"** tab
   - You should now see:
     - ✅ ECR permissions (for pushing Docker images)
     - ✅ CodeConnections permissions (for GitHub access)
     - ✅ Basic CodeBuild permissions (automatically added)

**If you skip this step, your builds will fail with permission errors!**

---

## Phase 5: First Build and Push to ECR

### Step 5.1: Start CodeBuild

1. **In CodeBuild Console:**
   - Find your project `blog-build`
   - Click **"Start build"** button
   - Click **"Start build"** again

2. **Monitor Build:**
   - Watch the build progress
   - Click on the build to see logs
   - Wait for status to show **"Succeeded"** (green)
   - This typically takes 5-10 minutes

### Step 5.2: Verify Images in ECR

1. **Go to ECR Console:**
   - Click on `blog-backend` repository
   - You should see images with tags: `latest` and a commit hash
   - Click on `blog-frontend` repository
   - You should see images there too

---

## Phase 6: Deploy to EC2

### Step 6.1: Login to ECR on EC2

**Connect to your EC2 instance** (using Session Manager or SSH), then:

```bash
cd ~/blog-app

# Login to ECR (replace with your values)
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

**Replace:**
- `us-east-1` with your region
- `YOUR_ACCOUNT_ID` with your 12-digit account ID

### Step 6.2: Pull and Start Containers

```bash
# Pull latest images
docker pull YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/blog-backend:latest
docker pull YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/blog-frontend:latest

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Press `Ctrl+C` to exit logs view**

### Step 6.3: Verify Deployment

**Check containers are running:**
```bash
docker ps
```

You should see 3 containers:
- `blog-postgres`
- `blog-backend`
- `blog-frontend`

**Test endpoints:**
```bash
# Health check
curl http://localhost:5000/health

# Get articles
curl http://localhost:5000/api/articles
```

---

## Phase 7: Access Your Application

### Step 7.1: Get Your EC2 Public IP

1. **Go to EC2 Console**
2. **Select your instance**
3. **Copy the "Public IPv4 address"**

### Step 7.2: Access Frontend

1. **Open your web browser**
2. **Go to:** `http://YOUR_EC2_PUBLIC_IP:3000`
3. **You should see:**
   - List of blog articles
   - At least 3 articles visible
   - Click on an article to view details

### Step 7.3: Test Backend API

**In your browser or using curl:**
- **Health Check:** `http://YOUR_EC2_PUBLIC_IP:5000/health`
- **Articles API:** `http://YOUR_EC2_PUBLIC_IP:5000/api/articles`

---

## Phase 8: Future Deployments (Updates)

When you make changes to your code:

### Step 8.1: Push Code to GitHub

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

### Step 8.2: Rebuild in CodeBuild

1. **Go to CodeBuild Console**
2. **Select `blog-build` project**
3. **Click "Start build"**
4. **Wait for build to complete**

### Step 8.3: Redeploy on EC2

**Connect to EC2 and run:**
```bash
cd ~/blog-app

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart containers
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 🔧 Troubleshooting

### Issue: Can't Connect to EC2

**Solution:**
- Check security group allows SSH (port 22) from your IP
- Verify instance is running
- Try using Session Manager instead of SSH

### Issue: CodeBuild Fails

**Check:**
- Build logs in CodeBuild console
- Verify `infra/buildspec.yml` exists in your repository
- Check environment variables are set correctly
- Verify ECR repositories exist

### Issue: "Error while executing command: aws ecr get-login-password" (Exit Status 1)

**This error means:** CodeBuild can't authenticate with ECR. The service role doesn't have ECR permissions, or environment variables are missing.

**Solution - Step 1: Verify Environment Variables**

1. **Go to CodeBuild Console:**
   - Find your project `blog-build`
   - Click **"Edit"** → Scroll to **"Environment"** section
   - Check **"Environment variables"** section

2. **Verify These Variables Exist:**
   - `AWS_ACCOUNT_ID` - Should be your 12-digit account ID (e.g., `971781420507`)
   - `AWS_DEFAULT_REGION` - Should be your region (e.g., `us-east-1`)

3. **If Missing, Add Them:**
   - Click **"Add environment variable"**
   - **Name:** `AWS_ACCOUNT_ID`
   - **Value:** Your AWS Account ID (12 digits)
   - **Type:** Plaintext
   - Click **"Add environment variable"** again
   - **Name:** `AWS_DEFAULT_REGION`
   - **Value:** Your region (e.g., `us-east-1`)
   - **Type:** Plaintext
   - Click **"Update environment"** to save

**Solution - Step 2: Add ECR Permissions to Service Role**

1. **Go to IAM Console:**
   - Search for "IAM" in AWS search bar
   - Click "IAM"

2. **Find Your CodeBuild Service Role:**
   - Click **"Roles"**
   - Search for your CodeBuild service role (e.g., `CodeBuildServiceRole-blog-build`)
   - Click on the role

3. **Check Existing Permissions:**
   - Look at **"Permissions"** tab
   - You should see policies like `AWSCodeBuildDeveloperAccess` or similar
   - If you see `ecr:*` permissions, skip to Step 3

4. **Add ECR Permissions:**
   - Click **"Add permissions"** → **"Attach policies"**
   - Search for `AmazonEC2ContainerRegistryFullAccess`
   - ✅ Check the box next to it
   - Click **"Add permissions"**

   **OR create a custom policy (more secure):**
   - Click **"Add permissions"** → **"Create inline policy"**
   - Click **"JSON"** tab
   - Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload"
            ],
            "Resource": "*"
        }
    ]
}
```

   - Click **"Next"**
   - **Policy name:** `CodeBuild-ECR-Access`
   - Click **"Create policy"**

**Solution - Step 3: Verify ECR Repositories Exist**

1. **Go to ECR Console:**
   - Search for "ECR" in AWS search bar
   - Click "Elastic Container Registry"

2. **Check Repositories:**
   - Verify `blog-backend` repository exists
   - Verify `blog-frontend` repository exists
   - If missing, create them (see Phase 2 of this guide)

3. **Verify Repository Names Match:**
   - Repository names must be exactly: `blog-backend` and `blog-frontend`
   - Case-sensitive!

**Solution - Step 4: Test the Command Manually**

1. **Create a Test Build with Debug Output:**
   - Edit your `buildspec.yml` (if you have access)
   - Add debug commands before the ECR login:

```yaml
pre_build:
  commands:
    - echo "Debug: Checking environment variables"
    - echo "AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID"
    - echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"
    - echo "Testing AWS CLI access..."
    - aws sts get-caller-identity
    - echo "Logging in to Amazon ECR..."
    - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
```

2. **Run Build Again:**
   - Check the logs to see which step fails
   - This will help identify the exact issue

**Solution - Step 5: Common Fixes**

**If environment variables show as empty:**
- Make sure variable names are EXACT: `AWS_ACCOUNT_ID` and `AWS_DEFAULT_REGION` (case-sensitive)
- Remove and re-add the variables
- Make sure "Type" is set to "Plaintext" not "Parameter store" or "Secrets Manager"

**If you see "Unable to locate credentials":**
- The service role doesn't have proper permissions
- Follow Solution - Step 2 above

**If you see "Repository does not exist":**
- The repository name in buildspec.yml doesn't match ECR repository name
- Check repository names are exactly: `blog-backend` and `blog-frontend`

**If you see "Access denied":**
- Your service role needs ECR permissions
- Follow Solution - Step 2 above

### Issue: "CLIENT_ERROR: Failed to get access token" or "Access denied to connection"

**This error means:** CodeBuild can't access your GitHub connection. The service role doesn't have permissions to use CodeConnections.

**Solution - Method 1: Add CodeConnections Permissions (Recommended)**

1. **Go to IAM Console:**
   - Search for "IAM" in AWS search bar
   - Click "IAM"

2. **Find Your CodeBuild Service Role:**
   - Click **"Roles"**
   - Search for your CodeBuild service role (e.g., `CodeBuildServiceRole-blog-build`)
   - Click on the role

3. **Add Inline Policy:**
   - Click **"Add permissions"** → **"Create inline policy"**
   - Click **"JSON"** tab
   - Paste this policy (replace `CONNECTION_ARN` with your connection ARN from the error):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "codeconnections:UseConnection"
            ],
            "Resource": "arn:aws:codeconnections:us-east-1:971781420507:connection/738521d7-b0c7-48f5-88ba-995bd111d555"
        }
    ]
}
```

   - **Replace the Resource ARN** with your actual connection ARN from the error message
   - Click **"Next"**
   - **Policy name:** `CodeBuild-CodeConnections-Access`
   - Click **"Create policy"**

4. **Retry Build:**
   - Go back to CodeBuild Console
   - Start a new build
   - The error should be resolved

**Solution - Method 2: Recreate Connection with Proper Permissions**

If Method 1 doesn't work:

1. **Go to CodeBuild Console:**
   - Find your project `blog-build`
   - Click **"Edit"** → **"Source"**

2. **Remove Current Connection:**
   - Note which GitHub repository you're using
   - Select a different source temporarily, save
   - Then edit again

3. **Reconnect GitHub:**
   - Select **"GitHub"** as source provider
   - Click **"Connect to GitHub"** or **"Connect using OAuth"**
   - Authorize AWS to access your GitHub account
   - Select your repository
   - **IMPORTANT:** Make sure to grant all requested permissions

4. **Update Service Role:**
   - After reconnecting, go back to IAM
   - The role should automatically get permissions
   - If not, use Method 1 above

**Solution - Method 3: Use GitHub Personal Access Token (Alternative)**

If CodeConnections continues to fail, use GitHub OAuth token:

1. **Create GitHub Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click **"Generate new token (classic)"**
   - Give it a name: `aws-codebuild`
   - Select scopes: `repo` (full control of private repositories)
   - Click **"Generate token"**
   - **Copy the token** (only shown once!)

2. **Update CodeBuild Source:**
   - Go to CodeBuild Console
   - Edit your project
   - Source → **"GitHub"** → **"Personal access token"**
   - Paste your token
   - Select repository and branch
   - Save changes

3. **Retry Build**

### Issue: Can't Pull Images on EC2

**Solution:**
```bash
# Verify ECR login
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Check AWS credentials
aws sts get-caller-identity

# Verify security group allows outbound HTTPS
```

### Issue: Containers Won't Start

**Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs
```

**Common fixes:**
- Verify `.env` file has correct values
- Check database password is set
- Verify image URIs are correct
- Check ports aren't already in use

### Issue: Frontend Shows Error

**Check:**
- Backend is running: `docker ps | grep backend`
- Backend is accessible: `curl http://localhost:5000/health`
- Security group allows port 5000
- Check browser console for errors

---

## 📊 Monitoring via Web Console

### View EC2 Status

1. **EC2 Console → Instances**
2. **Check instance state** (should be "Running")
3. **Check status checks** (should be "2/2 checks passed")

### View CodeBuild History

1. **CodeBuild Console → Build history**
2. **See all builds** and their status
3. **Click on build** to see detailed logs

### View ECR Images

1. **ECR Console → Repositories**
2. **Click repository** to see all images
3. **Click image** to see tags and scan results

### View CloudWatch Logs (Optional)

1. **CloudWatch Console → Log groups**
2. **Find log groups** for your services
3. **View real-time logs**

---

## 🔒 Security Best Practices

1. **Change Default Passwords:**
   - Use strong `DB_PASSWORD` in `.env` file
   - Don't use default values

2. **Restrict Security Groups:**
   - Only allow necessary ports
   - Restrict SSH to your IP only
   - Consider removing public access to backend (port 5000) if not needed

3. **Use IAM Roles (Advanced):**
   - Instead of access keys, attach IAM role to EC2
   - More secure and easier to manage

4. **Keep Images Updated:**
   - ECR automatically scans images
   - Review scan results regularly

5. **Monitor Costs:**
   - Go to **Billing & Cost Management** console
   - Set up billing alerts
   - All services used are free-tier eligible

---

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] ECR repositories created (backend and frontend)
- [ ] EC2 instance launched and running
- [ ] Security groups configured (ports 22, 3000, 5000)
- [ ] Docker and Docker Compose installed on EC2
- [ ] AWS CLI configured on EC2
- [ ] `.env` file created with correct values
- [ ] `docker-compose.prod.yml` created
- [ ] CodeBuild project created
- [ ] First build completed successfully
- [ ] Images visible in ECR
- [ ] Containers running on EC2
- [ ] Frontend accessible at http://EC2_IP:3000
- [ ] Backend accessible at http://EC2_IP:5000
- [ ] Health check returns success
- [ ] At least 3 articles visible

---

## 📝 Quick Reference

### Important URLs to Save

- **ECR Backend URI:** `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/blog-backend:latest`
- **ECR Frontend URI:** `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/blog-frontend:latest`
- **Frontend URL:** `http://EC2_PUBLIC_IP:3000`
- **Backend URL:** `http://EC2_PUBLIC_IP:5000`
- **Health Check:** `http://EC2_PUBLIC_IP:5000/health`

### AWS Console Links

- **EC2:** https://console.aws.amazon.com/ec2
- **ECR:** https://console.aws.amazon.com/ecr
- **CodeBuild:** https://console.aws.amazon.com/codesuite/codebuild
- **IAM:** https://console.aws.amazon.com/iam

---

## 🎯 Next Steps (Optional)

1. **Set up Auto-Deploy:**
   - In CodeBuild, enable webhook
   - Automatically build on git push

2. **Add Domain Name:**
   - Purchase domain
   - Configure Route 53
   - Point to EC2 IP

3. **Enable HTTPS:**
   - Set up Let's Encrypt
   - Configure SSL certificate

4. **Set up Monitoring:**
   - CloudWatch alarms
   - Health check monitoring
   - Log aggregation

---

**Congratulations! Your application is now deployed! 🎉**

For command-line deployment, see `DEPLOYMENT_GUIDE.md`

