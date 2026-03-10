import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from './ComplaintForm';
import api from '../api';
import StatusBadge from './StatusBadge';
import ActivityTimeline from './ActivityTimeline';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [complaints, setComplaints] = useState([]);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/');
            setComplaints(res.data);
        } catch (err) {
            console.error("Failed to fetch complaints", err);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-900 text-white p-6 hidden md:block fixed h-full">
                <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span>🏛️</span> CivicCopilot
                </h1>
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`}>
                        Overview
                    </button>
                    <button onClick={() => setActiveTab('report')} className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === 'report' ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`}>
                        Report Issue
                    </button>
                    <button onClick={() => setActiveTab('complaints')} className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === 'complaints' ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`}>
                        My Complaints
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 md:ml-64">
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">User</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-50 bg-opacity-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card border-l-4 border-indigo-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Complaints</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{complaints.length}</p>
                        </div>
                        <div className="card border-l-4 border-yellow-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Pending Approval</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{complaints.filter(c => c.status === 'pending_approval').length}</p>
                        </div>
                        <div className="card border-l-4 border-emerald-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Resolved</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{complaints.filter(c => c.status === 'resolved').length}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'report' && (
                    <ComplaintForm onSuccess={() => {
                        setActiveTab('complaints');
                        fetchComplaints();
                    }} />
                )}

                {(activeTab === 'complaints' || activeTab === 'overview') && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700">Recent Complaints</h3>
                        {complaints.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">No complaints found.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {complaints.map((complaint) => (
                                    <div key={complaint.id} className="card flex flex-col gap-4 hover:shadow-2xl transition-shadow">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">{complaint.issue}</h4>
                                                <div className="flex gap-2">
                                                    <StatusBadge status={complaint.status} />
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${complaint.severity === 'High' ? 'bg-red-100 text-red-800' :
                                                            complaint.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {complaint.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1">{complaint.location} • {complaint.department}</p>
                                            <p className="text-gray-700 mt-3">{complaint.summary}</p>

                                            {/* Show rejection reason if rejected */}
                                            {complaint.status === 'rejected' && complaint.rejection_reason && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                                                    <p className="text-sm text-red-700 mt-1">{complaint.rejection_reason}</p>
                                                </div>
                                            )}

                                            {/* Activity Timeline */}
                                            {complaint.activity_log && complaint.activity_log.length > 0 && (
                                                <details className="mt-4">
                                                    <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                                        View Activity Timeline ({complaint.activity_log.length} updates)
                                                    </summary>
                                                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                                        <ActivityTimeline activityLog={complaint.activity_log} />
                                                    </div>
                                                </details>
                                            )}

                                            <div className="mt-4 flex gap-2 text-xs text-gray-400">
                                                <span>ID: {complaint.id.substring(0, 8)}...</span>
                                                <span>•</span>
                                                <span>{new Date(complaint.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
