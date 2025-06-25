import React, { useEffect, useState } from 'react';
import './Admin.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from 'chart.js';

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
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
    const [editAdminId, setEditAdminId] = useState(null);
    const [editAdmin, setEditAdmin] = useState({ username: '', email: '', password: '' });
    const [adminError, setAdminError] = useState('');
    const [adminSuccess, setAdminSuccess] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState([
        // Initial static activities can be removed later
    ]);
    const [editUserId, setEditUserId] = useState(null);
    const [editUser, setEditUser] = useState({ username: '', email: '', password: '' });
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
    const [userError, setUserError] = useState('');
    const [userSuccess, setUserSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [apiKey, setApiKey] = useState('sk-xxxx-xxxx-xxxx');
    const [copySuccess, setCopySuccess] = useState('');
    const [testResult, setTestResult] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const fetchAdmins = () => {
        fetch('http://localhost:5000/api/admins')
            .then(response => response.json())
            .then(data => setAdmins(data))
            .catch(error => console.error('Error fetching admins:', error));
    };

    useEffect(() => {
        // Fetch admin info from backend and verify admin status
        const checkAdminAuthentication = async () => {
            const storedUsername = localStorage.getItem('username');
            if (!storedUsername) {
                setUsername('');
                localStorage.removeItem('username');
                setIsLoading(false);
                return;
            }

            try {
                // Use the admin-specific endpoint
                const response = await fetch('http://localhost:5000/auth/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: storedUsername })
                });

                if (response.ok) {
                    const adminData = await response.json();
                    setUsername(adminData.username);
                    localStorage.setItem('username', adminData.username);
                    console.log('✅ Admin authenticated successfully:', adminData.username);
                } else {
                    // This is not an admin - redirect to user dashboard
                    console.log('❌ Non-admin tried to access admin area:', storedUsername);
                    alert('⚠️ Access Denied: This area is for administrators only. Regular users should use the user dashboard.');
                    localStorage.removeItem('username');
                    setUsername('');
                    window.location.href = '/user';
                    return;
                }
            } catch (error) {
                console.error('Error checking admin authentication:', error);
                setUsername('');
                localStorage.removeItem('username');
            }

            setIsLoading(false);
        };

        checkAdminAuthentication();

        fetch('http://localhost:5000/api/users')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));

        fetchAdmins();
    }, []);

    useEffect(() => {
        const adminId = localStorage.getItem('admin_id');
        if (!adminId) return;
        fetch(`http://localhost:5000/api/admins/${adminId}`)
            .then(res => res.json())
            .then(data => {
                if (data.api_key) setApiKey(data.api_key);
            });
    }, []);

    // Helper to get color by activity type
    function getColorByType(type) {
        switch (type) {
            case 'add': return '#388e3c'; // green
            case 'edit': return '#7c3aed'; // purple
            case 'delete': return '#f9a825'; // yellow
            default: return '#e0e0e0';
        }
    }

    // Helper to format time
    function formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const handleCreateAdmin = (e) => {
        e.preventDefault();
        setAdminError('');
        setAdminSuccess('');
        fetch('http://localhost:5000/api/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAdmin)
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 201) {
                    setAdminSuccess('Admin created successfully');
                    setNewAdmin({ username: '', email: '', password: '' });
                    fetchAdmins();
                    setActivities(prev => [
                        { message: `Admin ${newAdmin.username} was created`, type: 'add', timestamp: new Date() },
                        ...prev,
                    ]);
                } else {
                    setAdminError(data.error || 'Failed to create admin');
                }
            })
            .catch(() => setAdminError('Failed to create admin'));
    };

    const handleEditClick = (admin) => {
        setEditAdminId(admin.id);
        setEditAdmin({ username: admin.username, email: admin.email, password: '' });
        setAdminError('');
        setAdminSuccess('');
    };

    const handleEditAdmin = (e) => {
        e.preventDefault();
        setAdminError('');
        setAdminSuccess('');
        fetch(`http://localhost:5000/api/admins/${editAdminId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editAdmin)
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    setAdminSuccess('Admin updated successfully');
                    setEditAdminId(null);
                    setEditAdmin({ username: '', email: '', password: '' });
                    fetchAdmins();
                    setActivities(prev => [
                        { message: `Admin ${editAdmin.username} was updated`, type: 'edit', timestamp: new Date() },
                        ...prev,
                    ]);
                } else {
                    setAdminError(data.error || 'Failed to update admin');
                }
            })
            .catch(() => setAdminError('Failed to update admin'));
    };

    const handleDeleteAdmin = (adminId) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        setAdminError('');
        setAdminSuccess('');
        const adminToDelete = admins.find(a => a.id === adminId);
        fetch(`http://localhost:5000/api/admins/${adminId}`, {
            method: 'DELETE'
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    setAdminSuccess('Admin deleted successfully');
                    fetchAdmins();
                    setActivities(prev => [
                        { message: `Admin ${adminToDelete?.username || ''} was deleted`, type: 'delete', timestamp: new Date() },
                        ...prev,
                    ]);
                } else {
                    setAdminError(data.error || 'Failed to delete admin');
                }
            })
            .catch(() => setAdminError('Failed to delete admin'));
    };

    // User handlers
    const handleEditUserClick = (user) => {
        setEditUserId(user.id);
        setEditUser({ username: user.username, email: user.email, password: '' });
    };

    const handleEditUser = (e) => {
        e.preventDefault();
        fetch(`http://localhost:5000/api/users/${editUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editUser)
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    setEditUserId(null);
                    setEditUser({ username: '', email: '', password: '' });
                    // Refresh users
                    fetch('http://localhost:5000/api/users')
                        .then(response => response.json())
                        .then(data => setUsers(data));
                    setActivities(prev => [
                        { message: `User ${editUser.username} was updated`, type: 'edit', timestamp: new Date() },
                        ...prev,
                    ]);
                }
            });
    };

    const handleDeleteUser = (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const userToDelete = users.find(u => u.id === userId);
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'DELETE'
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    // Refresh users
                    fetch('http://localhost:5000/api/users')
                        .then(response => response.json())
                        .then(data => setUsers(data));
                    setActivities(prev => [
                        { message: `User ${userToDelete?.username || ''} was deleted`, type: 'delete', timestamp: new Date() },
                        ...prev,
                    ]);
                }
            });
    };

    // Add User handler
    const handleAddUser = (e) => {
        e.preventDefault();
        setUserError('');
        setUserSuccess('');
        fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 201) {
                    setUserSuccess('User created successfully');
                    setNewUser({ username: '', email: '', password: '' });
                    setShowAddUser(false);
                    // Refresh users
                    fetch('http://localhost:5000/api/users')
                        .then(response => response.json())
                        .then(data => setUsers(data));
                    setActivities(prev => [
                        { message: `User ${newUser.username} was created`, type: 'add', timestamp: new Date() },
                        ...prev,
                    ]);
                } else {
                    setUserError(data.error || 'Failed to create user');
                }
            })
            .catch(() => setUserError('Failed to create user'));
    };

    async function saveApiKeyToBackend(newKey) {
        // Replace this with actual admin_id retrieval logic
        const adminId = localStorage.getItem('admin_id');
        if (!adminId) return;
        await fetch(`http://localhost:5000/api/admins/${adminId}/apikey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: newKey })
        });
    }

    function generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'sk-';
        for (let i = 0; i < 20; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setApiKey(key);
        saveApiKeyToBackend(key);
    }

    function handleCopyApiKey() {
        navigator.clipboard.writeText(apiKey).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 1200);
        });
    }

    async function handleTestApiKey() {
        setTestResult('');
        try {
            // Replace with your real endpoint if available
            const res = await fetch('http://localhost:5000/api/test-apikey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({ test: true })
            });
            if (res.ok) {
                setTestResult('API Key is valid! ✅');
            } else {
                setTestResult('API Key is invalid or not accepted. ❌');
            }
        } catch (err) {
            setTestResult('Error testing API Key.');
        }
    }

    // Handle avatar file selection
    function handleAvatarChange(e) {
        const file = e.target.files[0];
        setSelectedAvatar(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
        }
    }

    if (isLoading) {
        return (
            <div className="admin-container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: '#a78bfa',
                    fontSize: '1.2em'
                }}>
                    Loading admin data...
                </div>
            </div>
        );
    }

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
                        className={activeTab === 'admins' ? 'active' : ''}
                        onClick={() => setActiveTab('admins')}
                    >
                        Admins
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
                </nav>
            </div>
            <div className="admin-main">
                <div className="admin-header">
                    <h2 style={{ color: '#a78bfa', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.12)' }}>Welcome, {username}!</h2>
                    <button className="admin-create-btn" onClick={() => setShowAddUser(true)}>+ Add User</button>
                </div>
                {showAddUser && (
                    <div style={{ background: 'rgba(0,0,0,0.6)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#18122b', padding: '32px', borderRadius: '16px', minWidth: '320px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
                            <h3 style={{ color: '#a78bfa', marginBottom: '18px' }}>Add New User</h3>
                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} autoComplete="off">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                    autoComplete="off"
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px 14px',
                                        border: '1.5px solid #a78bfa',
                                        background: 'rgba(23,18,41,0.7)',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border 0.2s',
                                    }}
                                    onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
                                    onBlur={e => e.target.style.border = '1.5px solid #a78bfa'}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                    autoComplete="off"
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px 14px',
                                        border: '1.5px solid #a78bfa',
                                        background: 'rgba(23,18,41,0.7)',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border 0.2s',
                                    }}
                                    onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
                                    onBlur={e => e.target.style.border = '1.5px solid #a78bfa'}
                                />
                                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        autoComplete="new-password"
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px 38px 10px 14px',
                                            border: '1.5px solid #a78bfa',
                                            background: 'rgba(23,18,41,0.7)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            width: '100%',
                                            transition: 'border 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
                                        onBlur={e => e.target.style.border = '1.5px solid #a78bfa'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#a78bfa',
                                            cursor: 'pointer',
                                            fontSize: '1.1em',
                                            padding: 0,
                                            zIndex: 2
                                        }}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <button type="submit" className="admin-create-btn">Create</button>
                                    <button type="button" className="delete-btn" onClick={() => { setShowAddUser(false); setUserError(''); setUserSuccess(''); }}>Cancel</button>
                                </div>
                                {userError && <div style={{ color: 'red', marginTop: '8px' }}>{userError}</div>}
                                {userSuccess && <div style={{ color: 'green', marginTop: '8px' }}>{userSuccess}</div>}
                            </form>
                        </div>
                    </div>
                )}
                {activeTab === 'dashboard' && (
                    <div>
                        <h2>Welcome to the Admin Dashboard</h2>
                        <p style={{ color: '#a78bfa', marginBottom: '24px' }}>
                            Here you can manage users, settings, and view reports at a glance.
                        </p>
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                                <h3>Total Users</h3>
                                <p>{users.length}</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.7s ease-in-out' }}>
                                <h3>Active Sessions</h3>
                                <p>5</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.9s ease-in-out' }}>
                                <h3>Pending Reports</h3>
                                <p>2</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '32px', background: 'linear-gradient(135deg, #0a0821, #1a103d)', borderRadius: '18px', padding: '24px', color: '#e0e0e0', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)' }}>
                            <h3 style={{ color: '#e0e0e0', marginBottom: '16px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}>Recent Activities</h3>
                            <ul style={{ listStyleType: 'circle', padding: '0 20px', textAlign: 'left' }}>
                                {activities.length === 0 ? (
                                    <li>No recent activities</li>
                                ) : (
                                    activities.slice(0, 5).map((activity, idx) => (
                                        <li key={idx} style={{ marginBottom: '12px', color: getColorByType(activity.type) }}>
                                            {activity.message} <span style={{ fontSize: '0.85em', color: '#aaa' }}>({formatTime(activity.timestamp)})</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'users' && (
                    <div>
                        <h2>User Management</h2>
                        <div className="posts-list">
                            {users.map(user => (
                                <div className="post-item" key={user.id}>
                                    {editUserId === user.id ? (
                                        <form onSubmit={handleEditUser} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={editUser.username}
                                                onChange={e => setEditUser({ ...editUser, username: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="email"
                                                value={editUser.email}
                                                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                                                required
                                            />
                                            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type={showEditPassword ? 'text' : 'password'}
                                                    placeholder="New Password"
                                                    value={editUser.password}
                                                    onChange={e => setEditUser({ ...editUser, password: e.target.value })}
                                                    required
                                                    style={{ width: '100%', paddingRight: '36px', height: '38px', boxSizing: 'border-box' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEditPassword(v => !v)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 8,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        height: '28px',
                                                        width: '28px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#a78bfa',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2em',
                                                        padding: 0,
                                                        zIndex: 2
                                                    }}
                                                    tabIndex={-1}
                                                    aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showEditPassword ? '🙈' : '👁️'}
                                                </button>
                                            </div>
                                            <button type="submit" className="edit-btn">Save</button>
                                            <button type="button" className="delete-btn" onClick={() => setEditUserId(null)}>Cancel</button>
                                        </form>
                                    ) : (
                                        <>
                                            <h4>{user.username}</h4>
                                            <div className="post-meta">
                                                <span>Email: {user.email}</span>
                                            </div>
                                            <div className="post-actions">
                                                <button className="edit-btn" onClick={() => handleEditUserClick(user)}>Edit</button>
                                                <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Remove</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'admins' && (
                    <div>
                        <h2>Admin Management</h2>
                        <form onSubmit={handleCreateAdmin} style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        </form>
                        {adminError && <div style={{ color: 'red', marginBottom: '10px' }}>{adminError}</div>}
                        {adminSuccess && <div style={{ color: 'green', marginBottom: '10px' }}>{adminSuccess}</div>}
                        <div className="posts-list">
                            {admins.map(admin => (
                                <div className="post-item" key={admin.id} style={{ border: '1px solid #a78bfa22', borderRadius: '16px', marginBottom: '18px', padding: '18px' }}>
                                    {editAdminId === admin.id ? (
                                        <form onSubmit={handleEditAdmin} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={editAdmin.username}
                                                onChange={e => setEditAdmin({ ...editAdmin, username: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="email"
                                                value={editAdmin.email}
                                                onChange={e => setEditAdmin({ ...editAdmin, email: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                value={editAdmin.password}
                                                onChange={e => setEditAdmin({ ...editAdmin, password: e.target.value })}
                                                required
                                            />
                                            <button type="submit" className="edit-btn">Save</button>
                                            <button type="button" className="delete-btn" onClick={() => setEditAdminId(null)}>Cancel</button>
                                        </form>
                                    ) : (
                                        <>
                                            <h4>{admin.username}</h4>
                                            <div className="post-meta">
                                                <span>{admin.email}</span>
                                                <span>Created: {admin.created_at}</span>
                                            </div>
                                            <div className="post-actions">
                                                <button className="edit-btn" onClick={() => handleEditClick(admin)}>Edit</button>
                                                <button className="delete-btn" onClick={() => handleDeleteAdmin(admin.id)}>Delete</button>
                                            </div>
                                        </>
                                    )}
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
                                <div style={{ marginBottom: '22px' }}>
                                    <label style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>
                                        API Key
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="sk-xxxx-xxxx-xxxx"
                                            value={apiKey}
                                            readOnly
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid #a78bfa',
                                                background: 'rgba(23,18,41,0.7)',
                                                color: '#fff',
                                                fontSize: '1rem',
                                                flex: 1
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCopyApiKey}
                                            style={{
                                                background: '#a78bfa',
                                                color: '#18122b',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                minWidth: '60px'
                                            }}
                                        >
                                            {copySuccess ? copySuccess : 'Copy'}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        style={{
                                            marginTop: '8px',
                                            background: '#6c5ce7',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                        onClick={generateApiKey}
                                    >
                                        Regenerate Key
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            marginTop: '8px',
                                            marginLeft: '12px',
                                            background: '#43a047',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleTestApiKey}
                                    >
                                        Test Key
                                    </button>
                                    {testResult && <div style={{ color: testResult.includes('valid') ? 'green' : '#f87171', marginTop: '8px' }}>{testResult}</div>}
                                    <h3>Node.js (axios)</h3>
                                    <div style={{ background: 'rgba(23,18,41,0.7)', color: '#bdb4e6', fontSize: '0.95em', marginTop: '10px', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {`// Node.js (axios)\nconst axios = require('axios');\naxios.get('http://localhost:5000/api/protected', {\n  headers: { 'x-api-key': '${apiKey}' }\n})\n.then(res => console.log(res.data));`}
                                    </div>
                                    <h3>Python (requests)</h3>
                                    <div style={{ background: 'rgba(23,18,41,0.7)', color: '#bdb4e6', fontSize: '0.95em', marginTop: '10px', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {`# Python (requests)\nimport requests\nresponse = requests.get(\n    'http://localhost:5000/api/protected',\n    headers={'x-api-key': '${apiKey}'}\n)\nprint(response.json())`}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '22px' }}>
                                    <label style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>
                                        Change Profile Picture
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleAvatarChange}
                                        />
                                        <label htmlFor="avatar-upload" style={{
                                            background: '#6c5ce7',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 18px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            boxShadow: '0 2px 8px rgba(124,58,237,0.10)'
                                        }}>
                                            Choose File
                                        </label>
                                        <span style={{ color: '#bdb4e6', fontSize: '0.98em', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {selectedAvatar ? selectedAvatar.name : 'No file chosen'}
                                        </span>
                                    </div>
                                    {avatarPreview && (
                                        <div style={{ marginTop: '12px' }}>
                                            <img src={avatarPreview} alt="Avatar Preview" style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '12px', border: '2px solid #a78bfa' }} />
                                        </div>
                                    )}
                                    <div style={{ color: '#bdb4e6', fontSize: '0.95em', marginTop: '6px' }}>
                                        Upload a new avatar image (JPG, PNG, max 2MB).
                                    </div>
                                </div>
                                <div style={{ marginBottom: '22px' }}>
                                    <label style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>
                                        Admin Role
                                    </label>
                                    <select style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #a78bfa',
                                        background: 'rgba(23,18,41,0.7)',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}>
                                        <option value="superadmin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                        <option value="readonly">Read Only</option>
                                    </select>
                                    <div style={{ color: '#bdb4e6', fontSize: '0.95em', marginTop: '6px' }}>
                                        Only Super Admins can change roles.
                                    </div>
                                </div>
                                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                    <button
                                        style={{
                                            background: 'linear-gradient(90deg, #e11d48 0%, #f87171 100%)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '10px 22px',
                                            fontWeight: 700,
                                            fontSize: '1.08rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 10px rgba(124,58,237,0.12)',
                                            marginTop: '10px'
                                        }}
                                        onClick={() => window.confirm('Are you sure you want to delete your admin account? This action cannot be undone.')}
                                    >
                                        Delete Account
                                    </button>
                                    <div style={{ color: '#f87171', marginTop: '8px', fontSize: '0.98em' }}>
                                        Warning: This action is irreversible.
                                    </div>
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