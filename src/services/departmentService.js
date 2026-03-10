/**
 * Department API Service
 * Handles all department-related API calls
 */
import api from '../api';

// Get complaints assigned to this department
export const getDepartmentComplaints = async () => {
    const response = await api.get('/department/complaints');
    return response.data;
};

// Get only assigned complaints (status = assigned)
export const getAssignedComplaints = async () => {
    const response = await api.get('/department/complaints/assigned');
    return response.data;
};

// Get only in-progress complaints (status = in_progress)
export const getInProgressComplaints = async () => {
    const response = await api.get('/department/complaints/in-progress');
    return response.data;
};

// Get complaint by ID
export const getComplaintById = async (id) => {
    const response = await api.get(`/department/complaints/${id}`);
    return response.data;
};

// Start work on a complaint
export const startWork = async (id, notes = null) => {
    const response = await api.post(`/department/complaints/${id}/start`, {
        notes
    });
    return response.data;
};

// Resolve a complaint
export const resolveComplaint = async (id, resolutionNotes) => {
    const response = await api.post(`/department/complaints/${id}/resolve`, {
        resolution_notes: resolutionNotes
    });
    return response.data;
};

// Add a comment/update to a complaint
export const addComment = async (id, comment) => {
    const response = await api.post(`/department/complaints/${id}/comment`, {
        comment
    });
    return response.data;
};

// Get department dashboard statistics
export const getDepartmentStats = async () => {
    const response = await api.get('/department/stats');
    return response.data;
};
