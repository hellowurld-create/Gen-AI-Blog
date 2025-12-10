# Running Backend Locally - Step by Step Guide

This guide will help you run the backend locally in two ways:
1. **With Docker Compose** (Recommended - Easiest)
2. **Manual Setup** (With local PostgreSQL)

---

## Option 1: Using Docker Compose (Recommended)

This is the easiest way as it sets up both PostgreSQL and the backend automatically.

### Prerequisites
- Docker and Docker Compose installed
- Node.js (optional, only if you want to run without Docker)

### Steps

1. **Navigate to the project root directory**
   ```bash
   cd Technical-Test
   ```

2. **Start PostgreSQL and Backend together**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Start PostgreSQL database
   - Build and start the backend
   - Set up the database automatically

3. **Check if services are running**
   ```bash
   docker-compose ps
   ```

4. **View logs**
   ```bash
   # View all logs
   docker-compose logs -f
   
   # View only backend logs
   docker-compose logs -f backend
   ```

5. **Test the API**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # Get all articles
   curl http://localhost:5000/api/articles
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Environment Variables (Docker Compose)

The `docker-compose.yml` file already has the environment variables configured. If you want to use a HuggingFace API key, you can:

1. Create a `.env` file in the project root:
   ```env
   HUGGINGFACE_API_KEY=your_api_key_here
   ```

2. Update `docker-compose.yml` to use it:
   ```yaml
   environment:
     HUGGINGFACE_API_KEY: ${HUGGINGFACE_API_KEY:-}
   ```

---

## Option 2: Manual Setup (Local PostgreSQL)

Use this if you prefer to run PostgreSQL locally without Docker.

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running locally
- npm or yarn package manager

### Steps

1. **Install PostgreSQL** (if not already installed)
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **Mac**: `brew install postgresql@15`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**
   ```bash
   # Windows (run as administrator)
   net start postgresql-x64-15
   
   # Mac
   brew services start postgresql@15
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create the database** (optional - the app will create it automatically)
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE blogdb;
   
   # Exit
   \q
   ```

4. **Navigate to backend directory**
   ```bash
   cd backend
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env file with your PostgreSQL credentials
   # On Windows, you can use: notepad .env
   # On Mac/Linux: nano .env
   ```

7. **Configure .env file**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=blogdb
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here  # Optional
   ```

8. **Start the backend server**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

9. **Verify it's running**
   - You should see: `Server running on port 5000`
   - Open browser: http://localhost:5000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

10. **Test the API endpoints**
    ```bash
    # Health check
    curl http://localhost:5000/health
    
    # Get all articles
    curl http://localhost:5000/api/articles
    
    # Get single article (replace 1 with actual article ID)
    curl http://localhost:5000/api/articles/1
    ```

---

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Make sure PostgreSQL is running
- Check if the port 5432 is correct
- Verify DB_HOST, DB_PORT in .env file

**Error: "password authentication failed"**
- Check DB_USER and DB_PASSWORD in .env
- Verify PostgreSQL user exists and has correct password
- Try: `psql -U postgres` to test connection

**Error: "database does not exist"**
- The app will create it automatically on first run
- Or create manually: `CREATE DATABASE blogdb;`

### Port Already in Use

**Error: "Port 5000 already in use"**
```bash
# Find what's using port 5000
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000

# Change PORT in .env to a different port (e.g., 5001)
```

### Module Not Found

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### HuggingFace API Issues

- The app will work without the API key (uses fallback content)
- To get a free API key: https://huggingface.co/settings/tokens
- Add it to .env file: `HUGGINGFACE_API_KEY=your_key_here`

---

## Quick Start Commands Summary

### Docker Compose (Easiest)
```bash
cd Technical-Test
docker-compose up -d
# Backend runs on http://localhost:5000
```

### Manual Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run dev
# Backend runs on http://localhost:5000
```

---

## Next Steps

Once the backend is running:
1. Test the health endpoint: http://localhost:5000/health
2. Check articles: http://localhost:5000/api/articles
3. Start the frontend (see frontend/README.md)
4. The backend will automatically generate 3 initial articles on first run

---

## Development Tips

- Use `npm run dev` for development (auto-reloads on file changes)
- Check logs in the terminal for any errors
- The scheduler runs daily at 2:00 AM UTC
- Articles are stored in PostgreSQL and persist between restarts

