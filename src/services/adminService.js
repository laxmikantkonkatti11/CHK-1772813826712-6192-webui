/**
 * Admin API Service
 * Handles all admin-related API calls
 */
import api from '../api';

// Get pending complaints awaiting approval
export const getPendingComplaints = async () => {
    const response = await api.get('/admin/complaints/pending');
    return response.data;
};

// Get all complaints (all statuses)
export const getAllComplaints = async () => {
    const response = await api.get('/admin/complaints/all');
    return response.data;
};

// Get complaint by ID
export const getComplaintById = async (id) => {
    const response = await api.get(`/admin/complaints/${id}`);
    return response.data;
};

// Approve a complaint
export const approveComplaint = async (id, notes = null) => {
    const response = await api.post(`/admin/complaints/${id}/approve`, {
        notes
    });
    return response.data;
};

// Reject a complaint
export const rejectComplaint = async (id, reason) => {
    const response = await api.post(`/admin/complaints/${id}/reject`, {
        reason
    });
    return response.data;
};

// Get admin dashboard statistics
export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// Get complaints by status
export const getComplaintsByStatus = async (status) => {
    const response = await api.get(`/admin/complaints/by-status/${status}`);
    return response.data;
};
