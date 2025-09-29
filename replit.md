# Company Details Lookup - BotBot

## Overview
A full-stack React + Express.js application that allows users to submit company information through a form, processes it via an n8n webhook, and displays detailed company reviews and information in a dashboard.

## Recent Changes (Sep 29, 2025)
- **Project Import**: Successfully imported from GitHub and configured for Replit environment
- **Port Configuration**: Fixed port conflicts by moving backend to port 5001, frontend to port 5000
- **API Endpoints**: Updated hardcoded localhost URLs to use relative paths for Replit proxy compatibility
- **Vite Configuration**: Configured to bind to 0.0.0.0:5000 and allow all hosts for Replit's iframe proxy
- **Dependencies**: Installed all required packages for both client and server
- **Workflow Setup**: Configured "Full Stack App" workflow to run both frontend and backend simultaneously
- **Deployment Config**: Setup for autoscale deployment with production build process

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (external service)
- **Integration**: n8n webhook for data processing
- **Build Tool**: Vite
- **Process Management**: Concurrently for running multiple services

### Port Configuration
- **Frontend**: Port 5000 (Vite dev server)
- **Backend**: Port 5001 (Express.js server)
- **Database**: External MongoDB Atlas connection

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── index.css      # Tailwind CSS imports
│   │   └── main.jsx       # React entry point
│   ├── vite.config.js     # Vite configuration (configured for Replit)
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # Express server with MongoDB integration
│   └── package.json
├── package.json            # Root package with concurrently scripts
└── replit.md              # This documentation file
```

### API Endpoints
- `POST /api/submit` - Submit company information, triggers n8n webhook
- `GET /api/company/:companyName` - Fetch company data from MongoDB

### External Integrations
- **n8n Webhook**: Processes submitted company data
- **MongoDB Atlas**: Stores processed company information with embeddings
- **Company Data Sources**: Via n8n workflow integration

## Development Workflow
1. Both frontend and backend run simultaneously via the "Full Stack App" workflow
2. Frontend uses Vite proxy to forward `/api/*` requests to backend
3. Hot reload enabled for React development
4. Backend connects to external MongoDB for data persistence

## Deployment
- **Target**: Autoscale (stateless web application)
- **Build**: `npm run build:prod` (builds React frontend)
- **Run**: `npm start` (runs both frontend and backend)

## User Preferences
- Keep existing MongoDB setup rather than migrating to PostgreSQL
- Maintain original application functionality and structure
- Use Replit's built-in deployment for publishing when ready

## Current Status
- ✅ Application running successfully in development
- ✅ Frontend accessible on port 5000
- ✅ Backend API responding on port 5001
- ✅ Vite proxy configuration working for API calls
- ✅ Ready for testing and deployment