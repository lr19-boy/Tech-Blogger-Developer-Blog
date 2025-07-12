import React, { useState } from 'react';

function DebugFollowers() {
    const [username, setUsername] = useState('');
    const [followersCount, setFollowersCount] = useState(null);
    const [followingCount, setFollowingCount] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [error, setError] = useState('');

    const fetchCounts = async () => {
        setError('');
        setFollowersCount(null);
        setFollowingCount(null);
        try {
            const resFollowers = await fetch(`http://localhost:5000/api/followers/count/${username}`);
            const dataFollowers = await resFollowers.json();
            setFollowersCount(dataFollowers.followers_count);
            const resFollowing = await fetch(`http://localhost:5000/api/following/count/${username}`);
            const dataFollowing = await resFollowing.json();
            setFollowingCount(dataFollowing.following_count);
        } catch (e) {
            setError('Error fetching counts');
        }
    };

    const fetchLists = async () => {
        setError('');
        setFollowers([]);
        setFollowing([]);
        try {
            const resFollowers = await fetch(`http://localhost:5000/api/followers/${username}`);
            const dataFollowers = await resFollowers.json();
            setFollowers(dataFollowers);
            const resFollowing = await fetch(`http://localhost:5000/api/following/${username}`);
            const dataFollowing = await resFollowing.json();
            setFollowing(dataFollowing);
        } catch (e) {
            setError('Error fetching lists');
        }
    };

    return (
        <div style={{ padding: 24, background: '#222', color: '#fff', borderRadius: 8, maxWidth: 500, margin: '40px auto' }}>
            <h2>Debug Followers/Following</h2>
            <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ padding: 8, borderRadius: 4, marginBottom: 12, width: '100%' }}
            />
            <div style={{ marginBottom: 12 }}>
                <button onClick={fetchCounts} style={{ marginRight: 8 }}>Get Counts</button>
                <button onClick={fetchLists}>Get Lists</button>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            {followersCount !== null && <div>Followers Count: {followersCount}</div>}
            {followingCount !== null && <div>Following Count: {followingCount}</div>}
            {followers.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <strong>Followers List:</strong>
                    <ul>
                        {followers.map(f => <li key={f.id}>{f.follower_name || f.author_name}</li>)}
                    </ul>
                </div>
            )}
            {following.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <strong>Following List:</strong>
                    <ul>
                        {following.map(f => <li key={f.id}>{f.author_name || f.follower_name}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default DebugFollowers; 