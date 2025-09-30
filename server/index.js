// server.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let BotData;

try {
    await client.connect();
    const db = client.db("Bot");
    BotData = db.collection("BotData");
    console.log('MongoDB connected successfully');
} catch (err) {
    console.error('[ERROR] MongoDB connection failed:', err.message);
    process.exit(1);
}

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
        // Case-insensitive search with multiple strategies
        const projection = {
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
        };
        
        // Try 1: Exact match
        const escapedName = companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exactRegex = new RegExp(`^${escapedName}$`, 'i');
        let rawCompany = await BotData.findOne({ name: exactRegex }, projection);
        
        // Try 2: Search term contains DB name (e.g., "Neophron Tech" contains "Neophron")
        if (!rawCompany) {
            const allCompanies = await BotData.find({}, { projection: { name: 1 } }).toArray();
            const matchingCompany = allCompanies.find(company => {
                if (company.name && typeof company.name === 'string') {
                    return companyName.toLowerCase().includes(company.name.toLowerCase());
                }
                return false;
            });
            
            if (matchingCompany) {
                rawCompany = await BotData.findOne({ _id: matchingCompany._id }, projection);
            }
        }
        
        // Try 3: DB name contains search term (e.g., "Neophron" contains "Neo")
        if (!rawCompany) {
            const partialRegex = new RegExp(escapedName, 'i');
            rawCompany = await BotData.findOne({ name: partialRegex }, projection);
        }

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

// Serve static files from the React app in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// All other routes should serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 5001;
const HOST = 'localhost';
app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));
