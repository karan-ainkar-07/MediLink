import { useState } from "react";
import axios from "axios";
import {backendUrl} from "../constants.js"
export default function SymptomChecker() {
    const [description, setDescription] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${backendUrl}/userProfile/predict`,
                { description:description }
            );

            console.log(response);
            setResult(response.data.data); 
        } catch (err) {
            setError("Request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Symptom Checker</h1>

            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Enter symptoms (e.g. fever headache body pain)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    cols={50}
                />

                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? "Checking..." : "Predict"}
                </button>
            </form>

            <br />

            {error && <p style={{ color: "red" }}>{error}</p>}

            {result && (
                <div>
                    <h3>Prediction Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}