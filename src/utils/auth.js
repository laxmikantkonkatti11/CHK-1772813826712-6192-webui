/**
 * Authentication utility functions for role-based access control
 */

// Decode JWT token to extract user information
export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Get current user role from token
export const getUserRole = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const decoded = decodeToken(token);
    return decoded?.role || 'user';
};

// Get user department (for department users)
export const getUserDepartment = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const decoded = decodeToken(token);
    return decoded?.department || null;
};

// Get user email
export const getUserEmail = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const decoded = decodeToken(token);
    return decoded?.email || null;
};

// Get user UID
export const getUserUid = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const decoded = decodeToken(token);
    return decoded?.uid || null;
};

// Role checker functions
export const isAdmin = () => getUserRole() === 'admin';
export const isDepartment = () => getUserRole() === 'department';
export const isUser = () => getUserRole() === 'user';

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
        const decoded = decodeToken(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};

// Get dashboard path based on role
export const getDashboardPath = () => {
    const role = getUserRole();
    switch (role) {
        case 'admin':
            return '/admin';
        case 'department':
            return '/department';
        case 'user':
        default:
            return '/dashboard';
    }
};

// Clear all auth data
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    // Note: The axios interceptor will automatically not add the Authorization header
    // on the next request since localStorage is cleared.
    // If you're using this in a component, you should also manually clear if needed:
    // import api from '../api';
    // delete api.defaults.headers.common['Authorization'];
};
