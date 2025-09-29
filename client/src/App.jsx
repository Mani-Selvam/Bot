import { useState } from "react";
import axios from "axios";

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

    return (
        <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
                Company Details Lookup
            </h1>

            {!companyData && (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 bg-white p-6 rounded shadow-md">
                    {["name", "email", "companyName", "companyUrl"].map((f) => (
                        <input
                            key={f}
                            name={f}
                            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                            value={form[f]}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    ))}
                    <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
                        Submit
                    </button>
                </form>
            )}

            {loading && (
                <p className="mt-6 text-center text-blue-600 font-medium">
                    Fetching company data...
                </p>
            )}
            {error && (
                <p className="mt-6 text-center text-red-600 font-medium">
                    {error}
                </p>
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
    );
}
