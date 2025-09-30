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

// Helper function to clean MongoDB data (remove nulls from arrays and convert to strings)
function cleanMongoData(data) {
    if (data === null || data === undefined) return null;
    
    // If it's an array, filter out nulls and join
    if (Array.isArray(data)) {
        const cleaned = data
            .flat()
            .filter(item => item !== null && item !== undefined && (typeof item !== 'string' || item.trim() !== ''));
        return cleaned.length > 0 ? cleaned.join(', ') : null;
    }
    
    // If it's an object, recursively clean it
    if (typeof data === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(data)) {
            cleaned[key] = cleanMongoData(value);
        }
        return cleaned;
    }
    
    return data;
}

// Fetch company data from MongoDB after workflow completes
app.get("/api/company/:companyName", async (req, res) => {
    const companyName = req.params.companyName;
    
    console.log(`[API] Searching for company: "${companyName}"`);

    try {
        // Case-insensitive search using collation - fetch all fields
        const rawCompany = await BotData.findOne(
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
                    topReferences: 1,
                    timestamp: 1,
                    embedding: 1,
                    summary: 1,
                },
            },
        );

        if (!rawCompany) {
            console.log(`[API] Company not found in database: "${companyName}"`);
            return res.status(404).json({ error: "Company not found" });
        }

        // Clean the data and transform array fields
        const cleanedTopReferences = cleanMongoData(rawCompany.topReferences);
        const cleanedReferences = cleanMongoData(rawCompany.references);
        
        const company = {
            name: cleanMongoData(rawCompany.name),
            foundedYear: cleanMongoData(rawCompany.foundedYear),
            industry: cleanMongoData(rawCompany.industry),
            location: cleanMongoData(rawCompany.location),
            size: cleanMongoData(rawCompany.size),
            email: cleanMongoData(rawCompany.email),
            phone: cleanMongoData(rawCompany.phone),
            website: cleanMongoData(rawCompany.website),
            linkedin: cleanMongoData(rawCompany.linkedin),
            rating: cleanMongoData(rawCompany.rating),
            reviewSource: cleanMongoData(rawCompany.reviewSource),
            pros: cleanMongoData(rawCompany.pros),
            cons: cleanMongoData(rawCompany.cons),
            services: cleanMongoData(rawCompany.services),
            references: cleanedTopReferences ?? cleanedReferences,
            timestamp: rawCompany.timestamp,
            embedding: rawCompany.embedding,
            summary: cleanMongoData(rawCompany.summary),
        };

        console.log(`[API] Found company:`, company.name);
        res.json(company);
    } catch (err) {
        console.error(`[API] Error fetching company:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
