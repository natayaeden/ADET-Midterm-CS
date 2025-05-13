import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotificationService } from '../../services/NotificationService';
import './NotificationList.css';

const NotificationList = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await NotificationService.getNotifications();
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError('Failed to load notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      // Update the notification in the state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Update all notifications in the state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationLink = (notification) => {
    const { type, related_id, data } = notification;
    
    switch (type) {
      case 'task_assigned':
      case 'task_completed':
        return `/tasks/${related_id}`;
      default:
        return '#';
    }
  };

  const getNotificationIcon = (notification) => {
    const { type } = notification;
    
    switch (type) {
      case 'task_assigned':
        return 'bi-clipboard-check';
      case 'task_completed':
        return 'bi-check-circle';
      default:
        return 'bi-bell';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-container">
      <div className="notification-header d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Notifications</h6>
        {notifications.filter(n => !n.is_read).length > 0 && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-3 text-muted">
          <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
          <p>No notifications</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(notification => (
            <Link
              key={notification.id}
              to={getNotificationLink(notification)}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id);
                }
                onClose && onClose();
              }}
            >
              <div className="notification-icon">
                <i className={`bi ${getNotificationIcon(notification)}`}></i>
              </div>
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{getTimeAgo(notification.created_at)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 