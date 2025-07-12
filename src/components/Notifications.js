import React, { useState, useEffect, useCallback } from 'react';
import './Notifications.css';

const Notifications = ({ username, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${username}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      setError('Error fetching notifications');
      console.error('Error:', err);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchNotifications();
    }
  }, [username, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="notifications-content">
          {error && <div className="error-message">{error}</div>}
          {notifications.length === 0 ? (
            <div className="no-notifications" style={{ textAlign: 'center', padding: '32px 0', color: '#a78bfa' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>🔔</span>
              <p style={{ fontSize: '1.15rem', margin: 0 }}>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: 12 }}>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                  style={{
                    background: notification.is_read ? 'rgba(167,139,250,0.08)' : 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
                    color: notification.is_read ? '#fff' : '#fff',
                    borderRadius: 12,
                    boxShadow: notification.is_read ? '0 1px 4px rgba(167,139,250,0.07)' : '0 2px 8px rgba(124,58,237,0.13)',
                    padding: '18px 22px',
                    cursor: notification.is_read ? 'default' : 'pointer',
                    border: notification.is_read ? '1.5px solid #a78bfa' : '2px solid #7c3aed',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                  }}
                >
                  <div className="notification-content" style={{ flex: 1 }}>
                    <div className="notification-message" style={{ fontWeight: !notification.is_read ? 700 : 500, fontSize: '1.08rem', marginBottom: 4 }}>
                      {notification.message}
                    </div>
                    <div className="notification-time" style={{ color: '#c4b5fd', fontSize: '0.98rem' }}>
                      {formatTime(notification.created_at)}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="unread-indicator" style={{ width: 14, height: 14, borderRadius: '50%', background: '#facc15', marginLeft: 8, boxShadow: '0 0 8px #facc15' }}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 