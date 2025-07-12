#!/usr/bin/env python3
import requests
import json
import sqlite3
import time

def clear_test_data():
    print("🧹 Clearing test data...", flush=True)
    try:
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()
        
        # Delete test admin from both tables
        cursor.execute('DELETE FROM admins WHERE username = ? OR email = ?', ('testadmin123', 'testadmin123@example.com'))
        cursor.execute('DELETE FROM users WHERE username = ? OR email = ?', ('testadmin123', 'testadmin123@example.com'))
        conn.commit()
        conn.close()
        print("✅ Test data cleared", flush=True)
    except Exception as e:
        print(f"❌ Error clearing test data: {e}", flush=True)

def check_database_state():
    print("\n🔍 Checking database state...", flush=True)
    try:
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()
        
        # Check admins table
        cursor.execute('SELECT username, email, role FROM admins WHERE username = ?', ('testadmin123',))
        admin = cursor.fetchone()
        if admin:
            print(f"✅ Found in admins: {admin[0]} ({admin[1]}) - Role: {admin[2]}", flush=True)
        else:
            print("❌ Not found in admins table", flush=True)
        
        # Check users table
        cursor.execute('SELECT username, email, is_user FROM users WHERE username = ?', ('testadmin123',))
        user = cursor.fetchone()
        if user:
            user_type = "User" if user[2] else "Admin"
            print(f"⚠️  Found in users: {user[0]} ({user[1]}) - Type: {user_type}", flush=True)
        else:
            print("ℹ️  Not found in users table", flush=True)
        
        conn.close()
    except Exception as e:
        print(f"❌ Error checking database: {e}", flush=True)

def test_admin_signup():
    print("\n🧪 Testing Admin Signup...", flush=True)
    
    # Test data for new admin
    test_admin = {
        "isLogin": False,
        "username": "testadmin123",
        "email": "testadmin123@example.com",
        "password": "testpass123",
        "is_user": False  # This should be False for admin signup
    }
    
    print(f"📤 Sending request with data: {test_admin}", flush=True)
    
    try:
        response = requests.post('http://localhost:5000/auth', 
                               json=test_admin,
                               headers={'Content-Type': 'application/json'})
        
        print(f"📡 Response Status: {response.status_code}", flush=True)
        print(f"📡 Response: {response.text}", flush=True)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Admin signup successful!", flush=True)
            print(f"   Username: {data.get('username')}", flush=True)
            print(f"   Email: {data.get('email')}", flush=True)
            print(f"   Is User: {data.get('is_user')}", flush=True)
            print(f"   Redirect: {data.get('redirect')}", flush=True)
            return True
        else:
            print(f"❌ Admin signup failed: {response.text}", flush=True)
            return False
            
    except Exception as e:
        print(f"❌ Error testing admin signup: {e}", flush=True)
        return False

def test_admin_login():
    print("\n🧪 Testing Admin Login...", flush=True)
    
    # Test login with the admin we just created
    test_login = {
        "isLogin": True,
        "username": "testadmin123",
        "password": "testpass123",
        "is_user": False
    }
    
    try:
        response = requests.post('http://localhost:5000/auth', 
                               json=test_login,
                               headers={'Content-Type': 'application/json'})
        
        print(f"📡 Response Status: {response.status_code}", flush=True)
        print(f"📡 Response: {response.text}", flush=True)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin login successful!", flush=True)
            print(f"   Username: {data.get('username')}", flush=True)
            print(f"   Email: {data.get('email')}", flush=True)
            print(f"   Is User: {data.get('is_user')}", flush=True)
            print(f"   Redirect: {data.get('redirect')}", flush=True)
            return True
        else:
            print(f"❌ Admin login failed: {response.text}", flush=True)
            return False
            
    except Exception as e:
        print(f"❌ Error testing admin login: {e}", flush=True)
        return False

if __name__ == "__main__":
    print("🔧 Admin Signup Flow Test", flush=True)
    print("=" * 50, flush=True)
    
    # Clear any existing test data
    clear_test_data()
    
    # Check initial state
    check_database_state()
    
    # Test admin signup
    signup_success = test_admin_signup()
    
    # Wait a moment for database operations
    time.sleep(1)
    
    # Check where data was stored
    check_database_state()
    
    # Test admin login if signup was successful
    if signup_success:
        test_admin_login()
    
    print("\n" + "=" * 50, flush=True)
    print("🏁 Test complete!", flush=True) 