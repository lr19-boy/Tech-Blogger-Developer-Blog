import React, { useEffect, useState } from 'react';
import './Admin.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from 'chart.js';
import logoutIcon from '../logout.png';
import { useNavigate } from 'react-router-dom';

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

const reportData = {
  labels: ['Total Reports', 'Monthly Reports', 'Active Users'],
  datasets: [
    {
      label: 'Total Reports',
      data: [24, 22, 20, 18, 16],
      borderColor: '#1e88e5',
      borderWidth: 2,
      pointBackgroundColor: '#1e88e5',
      fill: false,
    },
    {
      label: 'Monthly Reports',
      data: [12, 10, 8, 6, 4],
      borderColor: '#43a047',
      borderWidth: 2,
      pointBackgroundColor: '#43a047',
      fill: false,
    },
    {
      label: 'Active Users',
      data: [8, 7, 6, 5, 4],
      borderColor: '#fbc02d',
      borderWidth: 2,
      pointBackgroundColor: '#fbc02d',
      fill: false,
    },
  ],
};

const reportOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [adminUsername, setAdminUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        setAdminUsername(storedUsername || '');
    }, []);
    
    useEffect(() => {
        fetch('http://localhost:5000/api/users')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    useEffect(() => {
        const isUser = localStorage.getItem('is_user');
        if (isUser === 'true') {
            navigate('/user');
        }
    }, [navigate]);

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h2>Admin Panel</h2>
                <nav className="admin-nav">
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={activeTab === 'settings' ? 'active' : ''}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                    <button
                        className={activeTab === 'reports' ? 'active' : ''}
                        onClick={() => setActiveTab('reports')}
                    >
                        Reports
                    </button>
                    <button className="logout-btn">
                        <img
                            className="logout-icon"
                            src={logoutIcon}
                            alt="Logout"
                            style={{ width: '20px', height: '20px', verticalAlign: 'middle' }}
                        />
                        <a href="/logout" style={{ textDecoration: 'none', color: '#E10600' }}>Logout</a>
                    </button>
                </nav>
            </div>
            <div className="admin-main">
                <div className="admin-header">
                    <h1>Welcome, {adminUsername}!</h1>
                    <button className="admin-create-btn">+ Add User</button>
                </div>
                {activeTab === 'dashboard' && (
                    <div>
                        <h2>Welcome to the Admin Dashboard</h2>
                        <p style={{ color: '#a78bfa', marginBottom: '24px' }}>
                            Here you can manage users, settings, and view reports at a glance.
                        </p>
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                                <h3>Total Users</h3>
                                <p>24</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.7s ease-in-out' }}>
                                <h3>Active Sessions</h3>
                                <p>5</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.9s ease-in-out' }}>
                                <h3>Pending Reports</h3>
                                <p>2</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 1.1s ease-in-out' }}>
                                <h3>System Alerts</h3>
                                <p>1</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '32px', background: 'linear-gradient(135deg, #0a0821, #1a103d)', borderRadius: '18px', padding: '24px', color: '#e0e0e0', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)' }}>
                          <h3 style={{ color: '#e0e0e0', marginBottom: '16px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}>Recent Activities</h3>
                          <ul style={{ listStyleType: 'circle', padding: '0 20px', textAlign: 'left' }}>
                            <li style={{ marginBottom: '12px', color: '#7c3aed' }}>User John updated profile</li>
                            <li style={{ marginBottom: '12px', color: '#388e3c' }}>Admin added a new user</li>
                            <li style={{ marginBottom: '12px', color: '#f9a825' }}>System alert resolved</li>
                          </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'users' && (
                    <div>
                        <h2>User Management</h2>
                        <div className="posts-list">
                            {users.map(user => (
                                <div className="post-item" key={user[0]}>
                                    <h4>{user[1]}</h4>
                                    <div className="post-meta">
                                        <span>{user[2]}</span>
                                        <span>Joined: {user[3]}</span>
                                    </div>
                                    <div className="post-actions">
                                        <button className="edit-btn">Edit</button>
                                        <button className="delete-btn">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="settings-content">
                        <h2>Admin Settings</h2>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: '18px',
                                padding: '32px',
                                maxWidth: '480px',
                                margin: '0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <form
                                style={{
                                    width: '100%',
                                    maxWidth: '360px',
                                    margin: '0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                }}
                            >
                                <div style={{ marginBottom: '22px' }}>
                                    <label
                                        htmlFor="admin-email"
                                        style={{
                                            color: '#a78bfa',
                                            fontWeight: 600,
                                            display: 'block',
                                            marginBottom: '7px',
                                        }}
                                    >
                                        Admin Email
                                    </label>
                                    <input
                                        id="admin-email"
                                        type="email"
                                        defaultValue="admin@email.com"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid #a78bfa',
                                            background: 'rgba(23,18,41,0.7)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '22px' }}>
                                    <label
                                        htmlFor="admin-password"
                                        style={{
                                            color: '#a78bfa',
                                            fontWeight: 600,
                                            display: 'block',
                                            marginBottom: '7px',
                                        }}
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="admin-password"
                                        type="password"
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid #a78bfa',
                                            background: 'rgba(23,18,41,0.7)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="admin-create-btn"
                                    style={{
                                        width: '100%',
                                        marginLeft: 0,
                                        marginTop: '10px',
                                    }}
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {activeTab === 'reports' && (
                    <div className="analytics-content">
                        <h2>Reports</h2>
                        <div className="report-stats-grid">
                            <div className="report-stat-card">
                                <h3>Total Reports</h3>
                                <p>24</p>
                                <span>Includes all submitted reports</span>
                            </div>
                            <div className="report-stat-card">
                                <h3>Monthly Reports</h3>
                                <p>12</p>
                                <span>Generated this month</span>
                            </div>
                            <div className="report-stat-card">
                                <h3>Active Users</h3>
                                <p>8</p>
                                <span>Currently online</span>
                            </div>
                        </div>
                        <div className="analytics-charts" style={{ marginTop: '32px', background: 'rgba(23, 18, 41, 0.85)', borderRadius: '18px', padding: '24px', minHeight: '200px', color: '#f8fafc', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}>
                            <h3 style={{ color: '#f8fafc', marginBottom: '16px' }}>Report Chart</h3>
                            <Line data={reportData} options={reportOptions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;