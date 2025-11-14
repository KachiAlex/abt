import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Clock, FileText, MessageSquare } from 'lucide-react';
import { socket } from '../../services/socket';
import { showInfo } from '../../utils/toast';
import clsx from 'clsx';

const notificationIcons = {
  DEADLINE: Clock,
  PAYMENT: CheckCircle,
  INSPECTION: AlertTriangle,
  APPROVAL: CheckCircle,
  REJECTION: AlertTriangle,
  SYSTEM: MessageSquare,
  SUBMISSION: FileText,
};

const notificationColors = {
  DEADLINE: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  PAYMENT: 'bg-green-50 border-green-200 text-green-800',
  INSPECTION: 'bg-blue-50 border-blue-200 text-blue-800',
  APPROVAL: 'bg-green-50 border-green-200 text-green-800',
  REJECTION: 'bg-red-50 border-red-200 text-red-800',
  SYSTEM: 'bg-gray-50 border-gray-200 text-gray-800',
  SUBMISSION: 'bg-purple-50 border-purple-200 text-purple-800',
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check if socket is available
    if (!socket) {
      console.warn('Socket.IO not available. Real-time notifications disabled.');
      return;
    }

    // Listen for real-time notifications
    const handleNewSubmission = (data) => {
      addNotification({
        id: `submission-${Date.now()}`,
        type: 'SUBMISSION',
        title: 'New Submission',
        message: `New submission received for project: ${data.projectName || 'Unknown'}`,
        timestamp: new Date(),
        read: false,
        data,
      });
    };

    const handleSubmissionReviewed = (data) => {
      addNotification({
        id: `review-${Date.now()}`,
        type: data.status === 'APPROVED' ? 'APPROVAL' : 'REJECTION',
        title: data.status === 'APPROVED' ? 'Submission Approved' : 'Submission Rejected',
        message: `Your submission for ${data.projectName || 'project'} has been ${data.status === 'APPROVED' ? 'approved' : 'rejected'}`,
        timestamp: new Date(),
        read: false,
        data,
      });
    };

    const handleProjectUpdated = (data) => {
      addNotification({
        id: `project-${Date.now()}`,
        type: 'SYSTEM',
        title: 'Project Updated',
        message: `Project "${data.projectName || 'Unknown'}" has been updated`,
        timestamp: new Date(),
        read: false,
        data,
      });
    };

    const handleDeadlineReminder = (data) => {
      addNotification({
        id: `deadline-${Date.now()}`,
        type: 'DEADLINE',
        title: 'Deadline Reminder',
        message: `Upcoming deadline: ${data.message || 'A project deadline is approaching'}`,
        timestamp: new Date(),
        read: false,
        data,
      });
    };

    // Register socket event listeners
    socket.on('new-submission', handleNewSubmission);
    socket.on('submission-reviewed', handleSubmissionReviewed);
    socket.on('project-updated', handleProjectUpdated);
    socket.on('deadline-reminder', handleDeadlineReminder);

    // Load existing notifications from localStorage
    const savedNotifications = localStorage.getItem('abt_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Error loading notifications:', e);
      }
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.off('new-submission', handleNewSubmission);
        socket.off('submission-reviewed', handleSubmissionReviewed);
        socket.off('project-updated', handleProjectUpdated);
        socket.off('deadline-reminder', handleDeadlineReminder);
      }
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('abt_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    showInfo(notification.message);
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('abt_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('abt_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('abt_notifications');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-abia-600 hover:text-abia-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || MessageSquare;
                    const colorClass = notificationColors[notification.type] || notificationColors.SYSTEM;
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={clsx(
                          'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                          !notification.read && 'bg-blue-50'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={clsx('p-2 rounded-lg', colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-abia-600 rounded-full mt-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={clearAll}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 text-center py-2"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

