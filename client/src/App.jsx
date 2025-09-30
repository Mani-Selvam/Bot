import { useState } from "react";
import axios from "axios";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Label } from "./components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/Card";
import { Badge } from "./components/ui/Badge";
import { Spinner } from "./components/ui/Spinner";
import { safeUrl } from "./utils/safeUrl";

export default function App() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        companyName: "",
        companyUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [companyData, setCompanyData] = useState(null);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    // Poll MongoDB until data is available
    const fetchCompany = async () => {
        const maxAttempts = 15; // total 30 seconds (enough for 10-15s n8n processing)
        let attempts = 0;
        console.log(`[Frontend] Starting to poll for company: "${form.companyName}"`);
        
        while (attempts < maxAttempts) {
            try {
                console.log(`[Frontend] Polling attempt ${attempts + 1}/${maxAttempts}`);
                const res = await axios.get(
                    `/api/company/${encodeURIComponent(form.companyName)}`
                );
                console.log(`[Frontend] Company data found!`, res.data);
                return res.data;
            } catch (error) {
                console.log(`[Frontend] Attempt ${attempts + 1} failed:`, error.response?.status || error.message);
                await new Promise((r) => setTimeout(r, 2000));
                attempts++;
            }
        }
        throw new Error("Company data not found after 30 seconds. Please check if your n8n workflow is activated and storing data correctly.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent page refresh
        setLoading(true);
        setCompanyData(null);
        setError("");

        try {
            // Submit user input to your backend → triggers n8n workflow
            await axios.post("/api/submit", form);

            // Wait and fetch data
            const data = await fetchCompany();
            setCompanyData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Clear displayed data to allow new search
    const handleClear = () => {
        setCompanyData(null);
        setForm({ name: "", email: "", companyName: "", companyUrl: "" });
        setError("");
    };

    const fieldLabels = {
        name: "Full Name",
        email: "Email Address", 
        companyName: "Company Name",
        companyUrl: "Company Website"
    };

    const fieldTypes = {
        name: "text",
        email: "email",
        companyName: "text", 
        companyUrl: "url"
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                        Company Details Lookup
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Discover comprehensive insights about any company
                    </p>
                </div>

                {!companyData && (
                    <Card className="max-w-2xl mx-auto animate-in">
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {["name", "email", "companyName", "companyUrl"].map((field) => (
                                        <div key={field} className="space-y-2">
                                            <Label htmlFor={field} required>
                                                {fieldLabels[field]}
                                            </Label>
                                            <Input
                                                id={field}
                                                name={field}
                                                type={fieldTypes[field]}
                                                value={form[field]}
                                                onChange={handleChange}
                                                placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
                                                disabled={loading}
                                                required
                                                className="transition-all duration-200"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <Button 
                                    type="submit" 
                                    className="w-full text-lg py-6" 
                                    size="lg"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {loading ? "Analyzing Company..." : "Get Company Insights"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {loading && (
                    <Card className="max-w-2xl mx-auto mt-6 animate-in">
                        <CardContent className="p-8 text-center">
                            <Spinner size="lg" className="mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Processing Your Request</h3>
                            <p className="text-muted-foreground">
                                Analyzing company data and gathering insights...
                            </p>
                        </CardContent>
                    </Card>
                )}
                
                {error && (
                    <Card className="max-w-2xl mx-auto mt-6 border-destructive animate-in">
                        <CardContent className="p-6 text-center">
                            <div className="text-destructive mb-2">⚠️</div>
                            <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {companyData && (
                    <div className="mt-8 animate-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Company Analysis Results</h2>
                            <Button
                                onClick={handleClear}
                                variant="outline"
                                size="sm"
                            >
                                🔄 New Search
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Company Overview Card */}
                            <Card className="animate-in">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl mb-2">{companyData.name}</CardTitle>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {companyData.industry && (
                                                    <Badge variant="secondary">{companyData.industry}</Badge>
                                                )}
                                                {companyData.size && (
                                                    <Badge variant="outline">{companyData.size}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground block">Founded</span>
                                            <span className="font-medium">{companyData.foundedYear || "Unknown"}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Location</span>
                                            <span className="font-medium">{companyData.location || "Unknown"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3 pt-4 border-t">
                                        {companyData.website && safeUrl(companyData.website) && (
                                            <a
                                                href={safeUrl(companyData.website)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                            >
                                                🌐 Website
                                            </a>
                                        )}
                                        {companyData.linkedin && safeUrl(companyData.linkedin) && (
                                            <a
                                                href={safeUrl(companyData.linkedin)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                            >
                                                💼 LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reviews & Ratings Card */}
                            <Card className="animate-in">
                                <CardHeader>
                                    <CardTitle className="text-xl">Reviews & Ratings</CardTitle>
                                    {companyData.rating && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-primary">{companyData.rating}</span>
                                            <Badge variant="secondary">{companyData.reviewSource}</Badge>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {companyData.pros && (
                                        <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                                            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                                                ✅ Strengths
                                            </h4>
                                            <p className="text-sm text-muted-foreground">{companyData.pros}</p>
                                        </div>
                                    )}
                                    {companyData.cons && (
                                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                                            <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                                                ⚠️ Areas for Improvement
                                            </h4>
                                            <p className="text-sm text-muted-foreground">{companyData.cons}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>

                        {/* Services & References Card - Full Width */}
                        <Card className="animate-in lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-xl">Services & References</CardTitle>
                                    <CardDescription>
                                        Business offerings and professional references
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {companyData.services && (
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                🎯 Services Offered
                                            </h4>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {companyData.services}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {companyData.references && (
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                📋 References
                                            </h4>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {companyData.references}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        {/* AI Analysis & Metadata Card */}
                        <Card className="animate-in lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        🤖 AI Analysis Summary
                                    </CardTitle>
                                    <CardDescription>
                                        Generated insights and analysis metadata
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {companyData.summary && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Executive Summary</h4>
                                            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {companyData.summary}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Analysis Date</span>
                                            <span>{companyData.timestamp ? new Date(companyData.timestamp).toLocaleDateString() : "Unknown"}</span>
                                        </div>
                                        {companyData.embedding && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                                    View Technical Data
                                                </summary>
                                                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                                                    Vector: [{companyData.embedding.slice(0, 5).join(", ")}...] ({companyData.embedding.length} dimensions)
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
