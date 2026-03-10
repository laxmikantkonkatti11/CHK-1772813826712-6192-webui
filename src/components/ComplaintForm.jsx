import React, { useState } from 'react';
import api from '../api';

const ComplaintForm = ({ onSuccess }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalysis(null); // Reset analysis on new image
        }
    };

    const analyzeComplaint = async () => {
        if (!text) {
            setError("Please provide a description of the issue.");
            return;
        }
        if (!image) {
            setError("Please upload an image of the issue. Images are required.");
            return;
        }
        setAnalyzing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('text', text || "Analyze this image");
            if (image) {
                formData.append('file', image);
            }

            const response = await api.post('/ai/analyze-complaint', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAnalysis(response.data);
        } catch (err) {
            console.error(err);
            setError("AI Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!analysis) {
            setError("Please analyze the complaint first.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...analysis,
                summary: analysis.summary || text,
                description: text
            };

            await api.post('/complaints/', payload);
            alert("Complaint Submitted Successfully!");
            setText('');
            setImage(null);
            setImagePreview(null);
            setAnalysis(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError("Failed to submit complaint.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto bg-white/80 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Report an Issue</h2>

            <div className="space-y-4">
                {/* Input Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Describe the Issue</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="input-field h-32"
                        placeholder="e.g., There is a large pothole on Main Street causing traffic."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Required)</span>
                    </label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    {imagePreview && (
                        <div className="mt-4 relative">
                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button onClick={() => { setImage(null); setImagePreview(null) }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Action */}
                <button
                    onClick={analyzeComplaint}
                    disabled={analyzing || !text || !image}
                    className="w-full btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {analyzing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Analyzing with Gemini AI...
                        </span>
                    ) : 'Analyze Issue ✨'}
                </button>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {/* Analysis Results */}
                {analysis && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 animate-fade-in">
                        <h3 className="font-semibold text-indigo-900 mb-3">AI Analysis Result</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500">Issue Type</span>
                                <span className="font-medium text-gray-900">{analysis.issue}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">Department</span>
                                <span className="font-medium text-gray-900">{analysis.department}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">Severity</span>
                                <span className={`font-medium px-2 py-0.5 rounded-full inline-block ${analysis.severity === 'High' ? 'bg-red-100 text-red-800' :
                                    analysis.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {analysis.severity}
                                </span>
                            </div>
                            <div>
                                <span className="block text-gray-500">Urgency Score</span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${analysis.urgency_score * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-gray-500">Location</span>
                                <span className="font-medium text-gray-900">{analysis.location}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full mt-4 btn-primary bg-green-600 hover:bg-green-700"
                        >
                            {loading ? 'Submitting...' : 'Submit Complaint ✅'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintForm;
