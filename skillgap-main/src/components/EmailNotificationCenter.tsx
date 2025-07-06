import React, { useState, useEffect } from 'react';
import { Mail, X, Eye, Trash2, BookMarked as MarkAsRead, ExternalLink } from 'lucide-react';
import { emailService, EmailNotification } from '../utils/emailService';
import { User } from '../utils/userStorage';

interface EmailNotificationCenterProps {
  user: User;
}

const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [user.id]);

  const loadNotifications = () => {
    const userNotifications = emailService.getUserNotifications(user.id);
    setNotifications(userNotifications);
    setUnreadCount(emailService.getUnreadCount(user.id));
  };

  const handleNotificationClick = (notification: EmailNotification) => {
    if (!notification.read) {
      emailService.markAsRead(notification.id);
      loadNotifications();
    }
    setSelectedNotification(notification);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return '👋';
      case 'assessment_completion':
        return '📊';
      case 'certificate_earned':
        return '🎓';
      default:
        return '📧';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'registration':
        return 'bg-blue-100 text-blue-800';
      case 'assessment_completion':
        return 'bg-green-100 text-green-800';
      case 'certificate_earned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Email Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
      >
        <Mail className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Email Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No email notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.subject}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getNotificationColor(notification.type)}`}>
                                  {notification.type.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Email Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Email Detail Modal */}
      {selectedNotification && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setSelectedNotification(null)}
          />
          <div className="fixed inset-4 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getNotificationIcon(selectedNotification.type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedNotification.subject}</h2>
                    <p className="text-sm text-gray-600">
                      {formatTimestamp(selectedNotification.timestamp)} • 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(selectedNotification.type)}`}>
                        {selectedNotification.type.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`mailto:${user.email}?subject=${encodeURIComponent(selectedNotification.subject)}`)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Open in email client"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedNotification.content }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailNotificationCenter;