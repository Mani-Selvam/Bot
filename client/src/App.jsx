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
        <div className="min-h-screen bg-background">
            {!companyData && !loading && !error && (
                <div className="min-h-screen flex">
                    {/* Left Side - Dark with Graphics */}
                    <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--dark-navy))] items-center justify-center p-12 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary rounded-full animate-pulse"></div>
                            <div className="absolute top-40 right-32 w-24 h-24 border-2 border-primary rounded-lg rotate-45 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-primary rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-primary rounded-lg rotate-12 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                        </div>
                        <div className="relative z-10 text-center max-w-md">
                            <div className="mb-8 flex justify-center">
                                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30">
                                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Discover Company Intelligence
                            </h2>
                            <p className="text-gray-300 leading-relaxed">
                                Access comprehensive company insights powered by AI. Get detailed analysis, ratings, services, and professional references in seconds.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[hsl(var(--form-bg))]">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-[hsl(var(--form-fg))] mb-2">
                                    Company Details Lookup
                                </h1>
                                <p className="text-gray-500">
                                    Discover comprehensive insights about any company
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {["name", "email", "companyName", "companyUrl"].map((field) => (
                                    <div key={field} className="space-y-2">
                                        <Label htmlFor={field} required className="text-[hsl(var(--form-fg))]">
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
                                            className="bg-gray-50 border-gray-200 text-[hsl(var(--form-fg))] focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                ))}
                                
                                <Button 
                                    type="submit" 
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                                    disabled={loading}
                                >
                                    Get Company Insights
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="max-w-md w-full mx-4 bg-card border-border">
                        <CardContent className="p-8 text-center">
                            <Spinner size="lg" className="mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Processing Your Request</h3>
                            <p className="text-muted-foreground">
                                Analyzing company data and gathering insights...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {error && (
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="max-w-md w-full mx-4 bg-card border-destructive">
                        <CardContent className="p-6 text-center">
                            <div className="text-destructive mb-2 text-2xl">⚠️</div>
                            <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={handleClear} variant="outline" className="border-border">
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {companyData && (
                <div className="min-h-screen p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-foreground">Company Analysis Results</h2>
                            <Button
                                onClick={handleClear}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                🔄 New Search
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Company Overview Card */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl mb-3 text-foreground">{companyData.name}</CardTitle>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {companyData.industry && (
                                                    <Badge className="bg-primary/20 text-primary border-primary/30">{companyData.industry}</Badge>
                                                )}
                                                {companyData.size && (
                                                    <Badge variant="outline" className="border-border text-muted-foreground">{companyData.size}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground block">Founded</span>
                                            <span className="font-medium text-foreground">{companyData.foundedYear || "Unknown"}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Location</span>
                                            <span className="font-medium text-foreground">{companyData.location || "Unknown"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3 pt-4 border-t border-border">
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
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-foreground">Reviews & Ratings</CardTitle>
                                    {companyData.rating && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-3xl font-bold text-primary">{companyData.rating}</span>
                                            <Badge className="bg-secondary text-secondary-foreground">{companyData.reviewSource}</Badge>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {companyData.pros && (
                                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                                ✅ Strengths
                                            </h4>
                                            <p className="text-sm text-muted-foreground">{companyData.pros}</p>
                                        </div>
                                    )}
                                    {companyData.cons && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
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
                        <Card className="mt-6 bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-2xl text-foreground">Services & References</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Business offerings and professional references
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {companyData.services && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                                            🎯 Services Offered
                                        </h4>
                                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {companyData.services}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {companyData.references && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                                            📋 References
                                        </h4>
                                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {companyData.references}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Analysis & Metadata Card */}
                        <Card className="mt-6 bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
                                    🤖 AI Analysis Summary
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Generated insights and analysis metadata
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {companyData.summary && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-foreground">Executive Summary</h4>
                                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {companyData.summary}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="pt-4 border-t border-border">
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
                </div>
            )}
        </div>
    );
}
