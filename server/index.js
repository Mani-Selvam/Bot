// server.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
await client.connect();
const db = client.db("Bot");
const BotData = db.collection("BotData");

// Submit form → send to n8n webhook
app.post("/api/submit", async (req, res) => {
    const { name, email, companyName, companyUrl } = req.body;
    
    console.log(`[SUBMIT] Sending to n8n webhook:`, {
        name,
        email,
        companyName,
        companyUrl,
    });

    try {
        // Send data to n8n webhook
        const response = await axios.post(process.env.N8N_WEBHOOK_URL, {
            name,
            email,
            companyName,
            companyUrl,
        });
        console.log(`[SUBMIT] n8n webhook response status:`, response.status);
        res.json({ status: "submitted" });
    } catch (err) {
        console.error(`[SUBMIT] Error sending to n8n:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// Fetch company data from MongoDB after workflow completes
app.get("/api/company/:companyName", async (req, res) => {
    const companyName = req.params.companyName;
    
    console.log(`[API] Searching for company: "${companyName}"`);

    try {
        // Case-insensitive search using collation
        const company = await BotData.findOne(
            { name: companyName },
            {
                collation: { locale: 'en', strength: 2 },
                projection: {
                    _id: 0,
                    name: 1,
                    foundedYear: 1,
                    industry: 1,
                    location: 1,
                    size: 1,
                    email: 1,
                    phone: 1,
                    website: 1,
                    linkedin: 1,
                    rating: 1,
                    reviewSource: 1,
                    pros: 1,
                    cons: 1,
                    services: 1,
                    references: 1,
                    timestamp: 1,
                    embedding: 1,
                    summary: 1,
                },
            },
        );

        if (!company) {
            console.log(`[API] Company not found in database: "${companyName}"`);
            return res.status(404).json({ error: "Company not found" });
        }

        console.log(`[API] Found company:`, company.name);
        res.json(company);
    } catch (err) {
        console.error(`[API] Error fetching company:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
