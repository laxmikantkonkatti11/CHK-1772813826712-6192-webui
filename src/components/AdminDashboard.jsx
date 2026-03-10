/**
 * Admin Dashboard Component
 * For admins to review, approve, and reject complaints
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEmail, logout as authLogout } from '../utils/auth';
import * as adminService from '../services/adminService';
import StatusBadge from './StatusBadge';
import ActivityTimeline from './ActivityTimeline';
import api from '../api'; // Import api instance to clear headers

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveNotes, setApproveNotes] = useState('');

    useEffect(() => {
        fetchStats();
        fetchComplaints();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const data = await adminService.getAdminStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            let data;
            if (activeTab === 'pending') {
                data = await adminService.getPendingComplaints();
            } else {
                data = await adminService.getAllComplaints();
            }
            setComplaints(data);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedComplaint) return;
        setActionLoading(true);
        try {
            await adminService.approveComplaint(selectedComplaint.id, approveNotes || null);
            alert('Complaint approved successfully!');
            setShowModal(false);
            setApproveNotes('');
            await Promise.all([fetchStats(), fetchComplaints()]);
        } catch (error) {
            console.error('Failed to approve complaint:', error);
            alert('Failed to approve complaint: ' + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedComplaint || !rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        if (rejectReason.length < 10) {
            alert('Rejection reason must be at least 10 characters');
            return;
        }
        setActionLoading(true);
        try {
            await adminService.rejectComplaint(selectedComplaint.id, rejectReason);
            alert('Complaint rejected');
            setShowModal(false);
            setRejectReason('');
            await Promise.all([fetchStats(), fetchComplaints()]);
        } catch (error) {
            console.error('Failed to reject complaint:', error);
            alert('Failed to reject complaint: ' + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = () => {
        authLogout();
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const openComplaintModal = (complaint) => {
        setSelectedComplaint(complaint);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white p-6 hidden md:block fixed h-full shadow-xl">
                <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span>👨‍💼</span> Admin Panel
                </h1>
                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all ${activeTab === 'pending' ? 'bg-indigo-700 shadow-lg' : 'hover:bg-indigo-700'
                            }`}
                    >
                        ⏳ Pending Approval
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all ${activeTab === 'all' ? 'bg-indigo-700 shadow-lg' : 'hover:bg-indigo-700'
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
                        {activeTab === 'pending' ? 'Pending Approval' : 'All Complaints'}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
                            <h3 className="text-gray-500 text-xs font-medium uppercase">Total</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_complaints}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                            <h3 className="text-gray-500 text-xs font-medium uppercase">Pending</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending_approval}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                            <h3 className="text-gray-500 text-xs font-medium uppercase">Approved</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                            <h3 className="text-gray-500 text-xs font-medium uppercase">Rejected</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                            <h3 className="text-gray-500 text-xs font-medium uppercase">In Progress</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.in_progress}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                            <h3 className="text-gray-500 text-xs font-medium uppercase">Resolved</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
                        </div>
                    </div>
                )}

                {/* Complaints List */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-gray-500 mt-2">Loading complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No complaints found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {complaints.map((complaint) => (
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
                                            <span>🏢 {complaint.department}</span>
                                            <span>📧 {complaint.user_email}</span>
                                            <span>📅 {new Date(complaint.timestamp).toLocaleDateString()}</span>
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
                                    {complaint.status === 'pending_approval' && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openComplaintModal(complaint);
                                                }}
                                                className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Review
                                            </button>
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
                                        <h3 className="font-semibold text-gray-700 mb-1">Department</h3>
                                        <p className="text-gray-600 capitalize">{selectedComplaint.department}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-1">Reported By</h3>
                                        <p className="text-gray-600">{selectedComplaint.user_email}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-1">Submitted</h3>
                                        <p className="text-gray-600">{new Date(selectedComplaint.timestamp).toLocaleString()}</p>
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

                            {/* Actions for pending complaints */}
                            {selectedComplaint.status === 'pending_approval' && (
                                <div className="space-y-4 border-t pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Approval Notes (Optional)
                                        </label>
                                        <textarea
                                            value={approveNotes}
                                            onChange={(e) => setApproveNotes(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            rows="2"
                                            placeholder="Add any notes about this approval..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason (Required if rejecting)
                                        </label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Minimum 10 characters required..."
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                            disabled={actionLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            disabled={actionLoading || !rejectReason.trim()}
                                        >
                                            {actionLoading ? 'Rejecting...' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Approving...' : 'Approve & Assign'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
