/**
 * Activity Timeline Component
 * Displays the activity log/timeline for a complaint
 */
import React from 'react';

const ActivityTimeline = ({ activityLog }) => {
    if (!activityLog || activityLog.length === 0) {
        return (
            <div className="text-gray-500 text-sm text-center py-4">
                No activity recorded yet
            </div>
        );
    }

    const getActionIcon = (action) => {
        const icons = {
            submitted: '📝',
            approved: '✅',
            rejected: '❌',
            assigned: '📌',
            started: '🚀',
            resolved: '🎉',
            comment: '💬',
        };
        return icons[action] || '📍';
    };

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {activityLog.map((activity, idx) => (
                    <li key={idx}>
                        <div className="relative pb-8">
                            {idx !== activityLog.length - 1 && (
                                <span
                                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                />
                            )}
                            <div className="relative flex items-start space-x-3">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                        {getActionIcon(activity.action)}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div>
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">
                                                {activity.by_email}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700">
                                        <p className="font-medium capitalize">{activity.action}</p>
                                        {activity.notes && (
                                            <p className="mt-1 text-gray-600 italic">{activity.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityTimeline;
