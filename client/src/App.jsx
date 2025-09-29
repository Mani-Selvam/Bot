import { useState } from "react";
import axios from "axios";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Label } from "./components/ui/Label";
import { Card, CardContent } from "./components/ui/Card";
import { Spinner } from "./components/ui/Spinner";

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
        const maxAttempts = 10; // total 20 seconds
        let attempts = 0;
        while (attempts < maxAttempts) {
            try {
                const res = await axios.get(
                    `/api/company/${form.companyName}`
                );
                return res.data;
            } catch {
                await new Promise((r) => setTimeout(r, 2000));
                attempts++;
            }
        }
        throw new Error("Company data not found after 20s");
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
                    <div className="mt-8">
                    <button
                        onClick={handleClear}
                        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
                        Clear / Search Another
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* General Info Card */}
                        <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
                            <h2 className="text-2xl font-bold mb-4">
                                {companyData.name}
                            </h2>
                            <p>
                                <span className="font-semibold">
                                    Founded Year:
                                </span>{" "}
                                {companyData.foundedYear}
                            </p>
                            <p>
                                <span className="font-semibold">Industry:</span>{" "}
                                {companyData.industry}
                            </p>
                            <p>
                                <span className="font-semibold">Location:</span>{" "}
                                {companyData.location}
                            </p>
                            <p>
                                <span className="font-semibold">Size:</span>{" "}
                                {companyData.size}
                            </p>
                            <p>
                                <span className="font-semibold">Website:</span>{" "}
                                <a
                                    href={companyData.website}
                                    target="_blank"
                                    className="text-blue-600 underline">
                                    {companyData.website}
                                </a>
                            </p>
                            <p>
                                <span className="font-semibold">LinkedIn:</span>{" "}
                                <a
                                    href={companyData.linkedin}
                                    target="_blank"
                                    className="text-blue-600 underline">
                                    {companyData.linkedin}
                                </a>
                            </p>
                        </div>

                        {/* Reviews & Ratings Card */}
                        <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
                            <h2 className="text-xl font-bold mb-4">
                                Reviews & Ratings
                            </h2>
                            <p>
                                <span className="font-semibold">Rating:</span>{" "}
                                {companyData.rating}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Review Source:
                                </span>{" "}
                                {companyData.reviewSource}
                            </p>
                            <p>
                                <span className="font-semibold text-green-600">
                                    Pros:
                                </span>{" "}
                                {companyData.pros}
                            </p>
                            <p>
                                <span className="font-semibold text-red-600">
                                    Cons:
                                </span>{" "}
                                {companyData.cons}
                            </p>
                        </div>

                        {/* Services Card */}
                        <div className="p-6 bg-white rounded shadow hover:shadow-lg transition md:col-span-2">
                            <h2 className="text-xl font-bold mb-4">
                                Services & References
                            </h2>
                            <p>
                                <span className="font-semibold">Services:</span>{" "}
                                {companyData.services}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    References:
                                </span>{" "}
                                {companyData.references}
                            </p>
                        </div>

                        {/* Metadata Card */}
                        <div className="p-6 bg-white rounded shadow hover:shadow-lg transition md:col-span-2">
                            <h2 className="text-xl font-bold mb-4">
                                Other Details
                            </h2>
                            <p>
                                <span className="font-semibold">
                                    Timestamp:
                                </span>{" "}
                                {companyData.timestamp}
                            </p>
                            <p>
                                <span className="font-semibold">Summary:</span>{" "}
                                {companyData.summary}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Embedding:
                                </span>{" "}
                                [{companyData.embedding.join(", ")}]
                            </p>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
