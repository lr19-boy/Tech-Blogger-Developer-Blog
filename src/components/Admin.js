import React, { useEffect, useState } from 'react';
import './Admin.css';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, BarElement } from 'chart.js';
import { Helmet } from 'react-helmet';
ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

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
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
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
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [userPasswords, setUserPasswords] = useState({});
    const [showUserPassword, setShowUserPassword] = useState({});
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarUploadMsg, setAvatarUploadMsg] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        activeSessions: 0,
        pendingReports: 0
    });
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [adminSettings, setAdminSettings] = useState({
        username: username,
        email: email,
        password: ''
    });

    const fetchAdmins = () => {
        fetch('http://localhost:5000/api/admins')
            .then(response => response.json())
            .then(data => {
                setAdmins(data);
                // Update stats when admins are fetched
                setStats(prev => ({ ...prev, totalAdmins: data.length }));
            })
            .catch(error => console.error('Error fetching admins:', error));
    };

    useEffect(() => {
        // Fetch admin info from backend and verify admin status
        const checkAdminAuthentication = async () => {
            const storedUsername = localStorage.getItem('username');
            console.log('Checking admin authentication for:', storedUsername);
            
            if (!storedUsername) {
                console.log('No username found in localStorage');
                setUsername('');
                setEmail('');
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

                console.log('Admin auth response status:', response.status);

                if (response.ok) {
                    const adminData = await response.json();
                    console.log('Admin auth successful:', adminData);
                    setUsername(adminData.username);
                    setEmail(adminData.email);
                    setRole(adminData.role || 'admin');
                    console.log('Current role:', adminData.role || 'admin');
                    localStorage.setItem('username', adminData.username);
                    console.log('✅ Admin authenticated successfully:', adminData.username);
                    
                    // Load existing avatar if available
                    await loadAdminAvatar(adminData.username);
                    setAdminSettings({
                        username: adminData.username,
                        email: adminData.email,
                        password: ''
                    });
                } else {
                    // This is not an admin - redirect to user dashboard
                    console.log('❌ Non-admin tried to access admin area:', storedUsername);
                    alert('⚠️ Access Denied: This area is for administrators only. Regular users should use the user dashboard.');
                    localStorage.removeItem('username');
                    setUsername('');
                    setEmail('');
                    window.location.href = '/user';
                    return;
                }
            } catch (error) {
                console.error('Error checking admin authentication:', error);
                setUsername('');
                setEmail('');
                localStorage.removeItem('username');
            }

            setIsLoading(false);
        };

        checkAdminAuthentication();

        fetch('http://localhost:5000/api/users')
            .then(response => response.json())
            .then(data => {
                setUsers(data);
                // Update stats when users are fetched
                setStats(prev => ({ ...prev, totalUsers: data.length }));
            })
            .catch(error => console.error('Error fetching users:', error));

        fetchAdmins();
    }, []);

    // Fetch passwords for all users after fetching users
    useEffect(() => {
        if (users.length === 0) return;
        users.forEach(user => {
            fetch(`http://localhost:5000/api/users/${user.id}/password`)
                .then(res => res.json())
                .then(data => {
                    if (data.password) {
                        setUserPasswords(prev => ({ ...prev, [user.id]: data.password }));
                    }
                });
        });
    }, [users]);

    // Persist activities to localStorage
    useEffect(() => {
        localStorage.setItem('adminActivities', JSON.stringify(activities));
    }, [activities]);

    // Load activities from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('adminActivities');
        if (saved) setActivities(JSON.parse(saved));
    }, []);

    // Helper function to check if admin has required role
    const hasRole = (requiredRole) => {
        const roleHierarchy = {
            'superadmin': 3,
            'admin': 2,
            'readonly': 1
        };
        const currentLevel = roleHierarchy[role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        return currentLevel >= requiredLevel;
    };

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
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-username': username
            },
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
                    setShowAddAdmin(false);
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
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-username': username
            },
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
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-username': username
            }
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
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-username': username
            },
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
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-username': username
            }
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
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-username': username
            },
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

    // Handle avatar file selection
    function handleAvatarChange(e) {
        const file = e.target.files[0];
        
        if (!file) {
            setSelectedAvatar(null);
            setAvatarUploadMsg('');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setAvatarUploadMsg('❌ Please select a valid image file (JPG, PNG, or GIF)');
            return;
        }
        
        // Validate file size (2MB limit)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            setAvatarUploadMsg('❌ File size must be less than 2MB');
            return;
        }
        
        setSelectedAvatar(file);
        setAvatarUploadMsg('');
        
        // Automatically upload the avatar when a file is selected
        handleAvatarUpload(file);
    }

    async function handleAvatarUpload(file) {
        if (!file || !username) {
            console.log('❌ Missing file or username for avatar upload');
            return;
        }
        
        setAvatarUploading(true);
        setAvatarUploadMsg('Uploading avatar...');
        
        const formData = new FormData();
        formData.append('username', username);
        formData.append('avatar', file);
        
        console.log('🔄 Uploading avatar for user:', username);
        console.log('📁 File details:', { name: file.name, size: file.size, type: file.type });
        
        try {
            const res = await fetch('http://localhost:5000/api/admin/avatar', {
                method: 'POST',
                body: formData,
            });
            
            console.log('📤 Upload response status:', res.status);
            
            if (res.ok) {
                const data = await res.json();
                console.log('✅ Upload successful, response:', data);
                setAvatarUploadMsg('✅ Avatar uploaded successfully!');
                setSelectedAvatar(null);
                
                // Clear the message after 3 seconds
                setTimeout(() => {
                    setAvatarUploadMsg('');
                }, 3000);
            } else {
                const errorData = await res.json();
                console.log('❌ Upload failed, error:', errorData);
                setAvatarUploadMsg(`❌ Upload failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('❌ Error uploading avatar:', err);
            setAvatarUploadMsg('❌ Error uploading avatar. Please try again.');
        }
        
        setAvatarUploading(false);
    }

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        const res = await fetch(`http://localhost:5000/api/admins/${username}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminSettings)
        });
        if (res.ok) {
            // Optionally show a success message or update state
            alert('Admin updated successfully!');
            // Optionally update local username/email state
            setUsername(adminSettings.username);
            setEmail(adminSettings.email);
        } else {
            alert('Failed to update admin');
        }
    };

    // Function to load admin's existing avatar
    async function loadAdminAvatar(adminUsername) {
        try {
            console.log('🔄 Loading avatar for admin:', adminUsername);
            const response = await fetch(`http://localhost:5000/api/admins/${adminUsername}/avatar`);
            console.log('Avatar response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Avatar data:', data);
                
                if (data.avatar) {
                    console.log('✅ Loaded existing avatar');
                } else {
                    console.log('❌ No avatar found for admin');
                }
            } else {
                console.log('❌ Failed to load avatar, status:', response.status);
            }
        } catch (error) {
            console.error('❌ Error loading admin avatar:', error);
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
            <Helmet>
                <title>Tech Blogger | Admin</title>
                <meta name="description" content="Manage users, admins, and settings in the admin panel." />
            </Helmet>
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
                                <p>{stats.totalUsers}</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.7s ease-in-out' }}>
                                <h3>Total Admins</h3>
                                <p>{stats.totalAdmins}</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 0.9s ease-in-out' }}>
                                <h3>Active Sessions</h3>
                                <p>{stats.activeSessions}</p>
                            </div>
                            <div className="admin-stat-card" style={{ animation: 'fadeIn 1.1s ease-in-out' }}>
                                <h3>Recent Activities</h3>
                                <p>{activities.length}</p>
                            </div>
                        </div>
                        {/* Admin Actions Chart */}
                        <div style={{ margin: '32px 0', background: 'rgba(23, 18, 41, 0.85)', borderRadius: '18px', padding: '24px', color: '#f8fafc', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}>
                            <h3 style={{ color: '#f8fafc', marginBottom: '16px' }}>Admin Actions Overview</h3>
                            <Bar
                                data={{
                                    labels: ['Add', 'Edit', 'Delete'],
                                    datasets: [
                                        {
                                            label: 'Action Count',
                                            data: [
                                                activities.filter(a => a.type === 'add').length,
                                                activities.filter(a => a.type === 'edit').length,
                                                activities.filter(a => a.type === 'delete').length
                                            ],
                                            backgroundColor: [
                                                '#388e3c', // add
                                                '#7c3aed', // edit
                                                '#f9a825'  // delete
                                            ],
                                            borderRadius: 8,
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { enabled: true },
                                    },
                                    scales: {
                                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                                    },
                                }}
                            />
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
                                                readOnly={false}
                                                disabled={false}
                                            />
                                            <input
                                                type="email"
                                                value={editUser.email}
                                                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                                                required
                                                readOnly={false}
                                                disabled={false}
                                            />
                                            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type={showEditPassword ? 'text' : 'password'}
                                                    placeholder="New Password"
                                                    value={editUser.password}
                                                    onChange={e => setEditUser({ ...editUser, password: e.target.value })}
                                                    required
                                                    style={{ width: '100%', paddingRight: '36px', height: '38px', boxSizing: 'border-box' }}
                                                    readOnly={false}
                                                    disabled={false}
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
                                                <span>Created: {user.created_at}</span>
                                                <div>
                                                    <label style={{ color: '#a78bfa', fontWeight: 600, marginRight: '8px' }}>Password:</label>
                                                    <span style={{
                                                        letterSpacing: '2px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '1.1em',
                                                        background: 'none',
                                                        color: '#fff',
                                                        marginRight: '8px'
                                                    }}>
                                                        {showUserPassword[user.id]
                                                            ? (userPasswords[user.id] || '')
                                                            : '●'.repeat((userPasswords[user.id] || '').length)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowUserPassword(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                                                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '1em' }}
                                                        aria-label={showUserPassword[user.id] ? 'Hide password' : 'Show password'}
                                                    >
                                                        {showUserPassword[user.id] ? '🙈' : '👁️'}
                                                    </button>
                                                </div>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button className="admin-create-btn" onClick={() => setShowAddUser(true)}>+ Add User</button>
                        </div>
                    </div>
                )}
                {activeTab === 'admins' && (
                    <div>
                        <h2>Admin Management</h2>
                        {/* Add Admin Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                            <button className="admin-create-btn" onClick={() => { setShowAddAdmin(true); setNewAdmin({ username: '', email: '', password: '' }); }}>+ Add Admin</button>
                        </div>
                        {/* Add Admin Modal */}
                        {showAddAdmin && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.6)',
                                zIndex: 1000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '16px',
                                autoComplete: 'one'
                            }}>
                                <div style={{
                                    background: '#18122b',
                                    padding: '32px',
                                    borderRadius: '16px',
                                    minWidth: '320px',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
                                }}>
                                    <h3 style={{ color: '#a78bfa', marginBottom: '18px' }}>Add New Admin</h3>
                                    <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} autoComplete="off">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={newAdmin.username}
                                            onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                            required
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
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newAdmin.email}
                                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            required
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
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={newAdmin.password}
                                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                            required
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
                                        />
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                            <button type="submit" className="admin-create-btn">Add Admin</button>
                                            <button type="button" className="delete-btn" onClick={() => { setShowAddAdmin(false); setAdminError(''); setAdminSuccess(''); setNewAdmin({ username: '', email: '', password: '' }); }}>Cancel</button>
                                        </div>
                                        {adminError && <div style={{ color: 'red', marginTop: '8px' }}>{adminError}</div>}
                                        {adminSuccess && <div style={{ color: 'green', marginTop: '8px' }}>{adminSuccess}</div>}
                                    </form>
                                </div>
                            </div>
                        )}
                        {/* End Add Admin Modal */}
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
                                onSubmit={handleSaveAdminSettings}
                            >
                                <div style={{ marginBottom: '22px' }}>
                                    <label
                                        htmlFor="admin-username"
                                        style={{
                                            color: '#a78bfa',
                                            fontWeight: 600,
                                            display: 'block',
                                            marginBottom: '7px',
                                        }}
                                    >
                                        Admin Username
                                    </label>
                                    <input
                                        id="admin-username"
                                        type="text"
                                        value={adminSettings.username}
                                        onChange={e => setAdminSettings({ ...adminSettings, username: e.target.value })}
                                        required
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
                                        value={adminSettings.email}
                                        onChange={e => setAdminSettings({ ...adminSettings, email: e.target.value })}
                                        required
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
                                        value={adminSettings.password}
                                        onChange={e => setAdminSettings({ ...adminSettings, password: e.target.value })}
                                        required
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
                                        Profile Picture
                                    </label>                                    
                                    {/* Upload Section */}
                                    <div style={{ 
                                        border: '2px dashed #a78bfa', 
                                        borderRadius: '12px', 
                                        padding: '20px', 
                                        textAlign: 'center',
                                        background: 'rgba(124,58,237,0.05)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleAvatarChange}
                                        />
                                        <label htmlFor="avatar-upload" style={{
                                            background: 'linear-gradient(135deg, #6c5ce7 0%, #a78bfa 100%)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '12px 24px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                                            transition: 'all 0.2s ease',
                                            display: 'inline-block'
                                        }}>
                                            📷 {avatarUploading ? 'Uploading...' : 'Choose New Picture'}
                                        </label>
                                        
                                        {/* Avatar Preview */}
                                        {selectedAvatar && (
                                            <div style={{ marginTop: '16px' }}>
                                                <img
                                                    src={URL.createObjectURL(selectedAvatar)}
                                                    alt="Avatar Preview"
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: '2px solid #a78bfa',
                                                        boxShadow: '0 2px 8px rgba(124,58,237,0.2)'
                                                    }}
                                                />
                                                <div style={{ color: '#bdb4e6', fontSize: '0.9em', marginTop: '8px' }}>
                                                    Preview
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Upload Status Messages */}
                                    {avatarUploadMsg && (
                                        <div style={{ 
                                            marginTop: '12px', 
                                            padding: '8px 12px', 
                                            borderRadius: '6px',
                                            fontSize: '0.9em',
                                            fontWeight: '500',
                                            textAlign: 'center',
                                            background: avatarUploadMsg.includes('✅') ? 'rgba(34,197,94,0.1)' : 
                                                       avatarUploadMsg.includes('❌') ? 'rgba(239,68,68,0.1)' : 
                                                       'rgba(124,58,237,0.1)',
                                            color: avatarUploadMsg.includes('✅') ? '#22c55e' : 
                                                   avatarUploadMsg.includes('❌') ? '#ef4444' : '#a78bfa',
                                            border: `1px solid ${avatarUploadMsg.includes('✅') ? '#22c55e' : 
                                                               avatarUploadMsg.includes('❌') ? '#ef4444' : '#a78bfa'}`
                                        }}>
                                            {avatarUploadMsg}
                                        </div>
                                    )}
                                </div>
                                {hasRole('admin') && (
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
                                            onClick={() => window.confirm('Are you sure you want to delete your admin account? This action is irreversible.')}
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                )}
                                {hasRole('admin') && (
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
                                )}
                            </form>
                        </div>
                    </div>
                )}
                {activeTab === 'reports' && (
                    <div className="analytics-content">
                        <h2>Reports</h2>
                        <div className="report-stats-grid">
                            <div className="report-stat-card">
                                <h3>Total Users</h3>
                                <p>{stats.totalUsers}</p>
                                <span>Registered users in the system</span>
                            </div>
                            <div className="report-stat-card">
                                <h3>Total Admins</h3>
                                <p>{stats.totalAdmins}</p>
                                <span>Administrative accounts</span>
                            </div>
                            <div className="report-stat-card">
                                <h3>Recent Activities</h3>
                                <p>{activities.length}</p>
                                <span>Actions performed recently</span>
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