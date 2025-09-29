# BotBot - Company Review Dashboard

A full-stack application that collects company information through a form, processes it via n8n webhook, and displays reviews in a dashboard.

## Tech Stack

-   **Frontend**: React + Tailwind CSS
-   **Backend**: Node.js + Express
-   **Database**: MongoDB (Mongoose)
-   **Integration**: n8n Webhook

## Features

-   Single-page application with form and dashboard
-   Real-time updates after form submission
-   Star rating display
-   Responsive design with Tailwind CSS
-   n8n webhook integration for review processing

## Project Structure

```
g:\Work\Bot\
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   ├── index.css     # Tailwind CSS imports
│   │   └── main.jsx      # React entry point
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/
│   │   └── BotBot.js     # Mongoose schema
│   ├── index.js          # Express server
│   ├── .env              # Environment variables
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Server Setup

```bash
cd server
npm install
```

Create a `.env` file based on `.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/botbot
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
PORT=5000
```

Start the server:

```bash
npm run dev
```

### 2. Client Setup

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

### 3. MongoDB Setup

Make sure MongoDB is running on your system. The database will be automatically created when you first run the server.

## API Endpoints

-   `GET /api/records` - Fetch all company reviews
-   `POST /api/submit` - Submit new company information

## n8n Webhook Integration

The backend forwards form data to your n8n webhook URL. The webhook should return a response with:

```json
{
    "reviewRating": 4,
    "pros": "Great company culture, excellent benefits",
    "cons": "Can be fast-paced, high expectations",
    "extraInfo": "Remote-friendly workplace"
}
```

If the webhook fails, default values will be used.

## Usage

1. Fill out the form with company information
2. Submit the form
3. The data is sent to n8n webhook for processing
4. Review results are saved to MongoDB
5. Dashboard updates instantly with new review

## Development

-   Frontend runs on http://localhost:5173
-   Backend runs on http://localhost:5000
-   MongoDB runs on mongodb://localhost:27017
