/**
 * Department Dashboard Component
 * For department users to handle assigned complaints
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEmail, getUserDepartment, logout as authLogout } from '../utils/auth';
import * as deptService from '../services/departmentService';
import StatusBadge from './StatusBadge';
import ActivityTimeline from './ActivityTimeline';

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assigned');
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [workNotes, setWorkNotes] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [comment, setComment] = useState('');
    const department = getUserDepartment();

    useEffect(() => {
        fetchStats();
        fetchComplaints();
    }, [activeTab]); // Re-fetch when tab changes

    const fetchStats = async () => {
        try {
            const data = await deptService.getDepartmentStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            let data;
            // Call different API based on active tab
            if (activeTab === 'assigned') {
                data = await deptService.getAssignedComplaints();
            } else if (activeTab === 'in_progress') {
                data = await deptService.getInProgressComplaints();
            } else {
                // 'all' tab - get all complaints for this department
                data = await deptService.getDepartmentComplaints();
            }
            setComplaints(data);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartWork = async () => {
        if (!selectedComplaint) return;
        setActionLoading(true);
        try {
            await deptService.startWork(selectedComplaint.id, workNotes || null);
            alert('Started working on complaint!');
            setWorkNotes('');
            await Promise.all([fetchStats(), fetchComplaints()]);
            // Refresh modal data
            const updated = await deptService.getComplaintById(selectedComplaint.id);
            setSelectedComplaint(updated);
        } catch (error) {
            console.error('Failed to start work:', error);
            alert('Failed to start work: ' + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedComplaint || !resolutionNotes.trim()) {
            alert('Please provide resolution notes');
            return;
        }
        if (resolutionNotes.length < 10) {
            alert('Resolution notes must be at least 10 characters');
            return;
        }
        setActionLoading(true);
        try {
            await deptService.resolveComplaint(selectedComplaint.id, resolutionNotes);
            alert('Complaint resolved successfully!');
            setShowModal(false);
            setResolutionNotes('');
            await Promise.all([fetchStats(), fetchComplaints()]);
        } catch (error) {
            console.error('Failed to resolve:', error);
            alert('Failed to resolve: ' + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!selectedComplaint || !comment.trim()) {
            alert('Please enter a comment');
            return;
        }
        setActionLoading(true);
        try {
            await deptService.addComment(selectedComplaint.id, comment);
            alert('Comment added!');
            setComment('');
            // Refresh modal data
            const updated = await deptService.getComplaintById(selectedComplaint.id);
            setSelectedComplaint(updated);
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment: ' + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = () => {
        authLogout();
        navigate('/login');
    };

    const openComplaintModal = async (complaint) => {
        try {
            // Fetch full details
            const fullComplaint = await deptService.getComplaintById(complaint.id);
            setSelectedComplaint(fullComplaint);
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch complaint details:', error);
            setSelectedComplaint(complaint);
            setShowModal(true);
        }
    };

    // No need for frontend filtering anymore - backend does it
    const filteredComplaints = complaints;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white p-6 hidden md:block fixed h-full shadow-xl">
                <h1 className="text-2xl font-bold mb-2">{stats?.department_name || 'Department'}</h1>
                <p className="text-purple-200 text-sm mb-8">Department Portal</p>
                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all ${activeTab === 'assigned' ? 'bg-purple-700 shadow-lg' : 'hover:bg-purple-700'
                            }`}
                    >
                        📌 Assigned
                    </button>
                    <button
                        onClick={() => setActiveTab('in_progress')}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all ${activeTab === 'in_progress' ? 'bg-purple-700 shadow-lg' : 'hover:bg-purple-700'
                            }`}
                    >
                        🚀 In Progress
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all ${activeTab === 'all' ? 'bg-purple-700 shadow-lg' : 'hover:bg-purple-700'
                            }`}
                    >
                        📋 All Complaints
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 md:ml-64">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'assigned' ? 'Assigned Complaints' :
                            activeTab === 'in_progress' ? 'In Progress' : 'All Complaints'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">{getUserEmail()}</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Assigned</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assigned_complaints}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">In Progress</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.in_progress}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Resolved</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.resolved}</p>
                        </div>
                    </div>
                )}

                {/* Complaints List */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="text-gray-500 mt-2">Loading complaints...</p>
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No complaints in this category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                                onClick={() => openComplaintModal(complaint)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{complaint.issue}</h3>
                                            <StatusBadge status={complaint.status} />
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${complaint.severity === 'High' ? 'bg-red-100 text-red-800' :
                                                complaint.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {complaint.severity}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{complaint.summary}</p>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>📍 {complaint.location}</span>
                                            <span>📅 {new Date(complaint.assigned_at || complaint.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Image Thumbnail */}
                                    {complaint.image_url && (
                                        <div className="ml-4 flex-shrink-0">
                                            <img
                                                src={complaint.image_url}
                                                alt="Complaint thumbnail"
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Complaint Detail Modal */}
            {showModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.issue}</h2>
                                    <div className="flex gap-2">
                                        <StatusBadge status={selectedComplaint.status} />
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedComplaint.severity === 'High' ? 'bg-red-100 text-red-800' :
                                            selectedComplaint.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {selectedComplaint.severity}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                                    <p className="text-gray-600">{selectedComplaint.description}</p>
                                </div>

                                {/* Image Display */}
                                {selectedComplaint.image_url && (
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Complaint Image</h3>
                                        <div className="rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={selectedComplaint.image_url}
                                                alt="Complaint evidence"
                                                className="w-full h-auto max-h-96 object-contain bg-gray-50"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="150" dx="120"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-1">Location</h3>
                                        <p className="text-gray-600">{selectedComplaint.location}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-1">Reported By</h3>
                                        <p className="text-gray-600">{selectedComplaint.user_email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            {selectedComplaint.activity_log && selectedComplaint.activity_log.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-3">Activity Timeline</h3>
                                    <ActivityTimeline activityLog={selectedComplaint.activity_log} />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-4 border-t pt-4">
                                {/* Start Work - only for assigned status */}
                                {selectedComplaint.status === 'assigned' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Work Notes (Optional)
                                            </label>
                                            <textarea
                                                value={workNotes}
                                                onChange={(e) => setWorkNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                rows="2"
                                                placeholder="Add notes about starting this work..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleStartWork}
                                            className="w-full px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors"
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Starting...' : '🚀 Start Work'}
                                        </button>
                                    </>
                                )}

                                {/* Add Comment - for assigned or in_progress */}
                                {(selectedComplaint.status === 'assigned' || selectedComplaint.status === 'in_progress') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Add Progress Update
                                            </label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                rows="2"
                                                placeholder="Add a progress comment..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddComment}
                                            className="w-full px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                            disabled={actionLoading || !comment.trim()}
                                        >
                                            {actionLoading ? 'Adding...' : '💬 Add Comment'}
                                        </button>
                                    </>
                                )}

                                {/* Resolve - for assigned or in_progress */}
                                {(selectedComplaint.status === 'assigned' || selectedComplaint.status === 'in_progress') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Resolution Notes (Required, min 10 characters)
                                            </label>
                                            <textarea
                                                value={resolutionNotes}
                                                onChange={(e) => setResolutionNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                rows="3"
                                                placeholder="Describe how this complaint was resolved..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleResolve}
                                            className="w-full px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            disabled={actionLoading || !resolutionNotes.trim() || resolutionNotes.length < 10}
                                        >
                                            {actionLoading ? 'Resolving...' : '✅ Mark as Resolved'}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentDashboard;
