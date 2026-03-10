/**
 * Status Badge Component
 * Displays color-coded status badges for complaints
 */
import React from 'react';

const statusConfig = {
    pending_approval: {
        label: 'Pending Approval',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
    },
    approved: {
        label: 'Approved',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
    },
    rejected: {
        label: 'Rejected',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
    },
    assigned: {
        label: 'Assigned',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-200',
    },
    in_progress: {
        label: 'In Progress',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-200',
    },
    resolved: {
        label: 'Resolved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
    },
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || {
        label: status,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        >
            {config.label}
        </span>
    );
};

export default StatusBadge;
