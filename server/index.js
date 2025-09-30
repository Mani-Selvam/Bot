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

    try {
        // Send data to n8n webhook
        await axios.post(process.env.N8N_WEBHOOK_URL, {
            name,
            email,
            companyName,
            companyUrl,
        });
        res.json({ status: "submitted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch company data from MongoDB after workflow completes
app.get("/api/company/:companyName", async (req, res) => {
    const companyName = req.params.companyName;

    try {
        const company = await BotData.findOne(
            { name: companyName },
            {
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

        if (!company)
            return res.status(404).json({ error: "Company not found" });

        res.json(company);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
