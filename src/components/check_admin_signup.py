#!/usr/bin/env python3
import sqlite3
import requests
import json

def check_database():
    print("🔍 Checking current database state...", flush=True)
    try:
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()
        
        # Check admins table
        cursor.execute('SELECT username, email, role FROM admins')
        admins = cursor.fetchall()
        print(f"📊 Current admins in database: {len(admins)}", flush=True)
        for admin in admins:
            print(f"  - {admin[0]} ({admin[1]}) - Role: {admin[2]}", flush=True)
        
        # Check users table
        cursor.execute('SELECT username, email, is_user FROM users')
        users = cursor.fetchall()
        print(f"📊 Current users in database: {len(users)}", flush=True)
        for user in users:
            user_type = "User" if user[2] else "Admin"
            print(f"  - {user[0]} ({user[1]}) - Type: {user_type}", flush=True)
        
        conn.close()
    except Exception as e:
        print(f"❌ Error checking database: {e}", flush=True)

def delete_test_admin():
    print("🧹 Deleting test admin if exists...", flush=True)
    try:
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM admins WHERE username = ? OR email = ?',( "testadmin123", "testadmin123@example.com"))
        conn.commit()
        conn.close()
        print("✅ Test admin deleted (if existed)", flush=True)
    except Exception as e:
        print(f"❌ Error deleting test admin: {e}", flush=True)

def test_admin_signup():
    print("\n🧪 Testing Admin Signup...", flush=True)
    
    # Test data for new admin
    test_admin = {
        "isLogin": False,
        "username": "testadmin123",
        "email": "testadmin123@example.com",
        "password": "testpass123",
        "isUser": False
    }
    
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
            print(f"   Redirect: {data.get('redirect')}", flush=True)
            print(f"   Is User: {data.get('is_user')}", flush=True)
        else:
            print(f"❌ Admin signup failed: {response.text}", flush=True)
            
    except Exception as e:
        print(f"❌ Error testing admin signup: {e}", flush=True)

def test_admin_login():
    print("\n🧪 Testing Admin Login...", flush=True)
    
    # Test login with the admin we just created
    test_login = {
        "isLogin": True,
        "username": "testadmin123",
        "password": "testpass123",
        "isUser": False
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
            print(f"   Redirect: {data.get('redirect')}", flush=True)
            print(f"   Is User: {data.get('is_user')}", flush=True)
        else:
            print(f"❌ Admin login failed: {response.text}", flush=True)
            
    except Exception as e:
        print(f"❌ Error testing admin login: {e}", flush=True)

if __name__ == "__main__":
    print("🔧 Admin Signup Diagnostic Tool", flush=True)
    print("=" * 50, flush=True)
    
    check_database()
    delete_test_admin()
    test_admin_signup()
    test_admin_login()
    
    print("\n" + "=" * 50, flush=True)
    print("🏁 Diagnostic complete!", flush=True) 