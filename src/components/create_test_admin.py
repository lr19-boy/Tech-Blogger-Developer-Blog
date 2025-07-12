#!/usr/bin/env python3
import requests
import json

def create_test_admin():
    print("🧪 Creating test admin...", flush=True)
    
    # Test data for new admin
    test_admin = {
        "isLogin": False,
        "username": "testadmin",
        "email": "testadmin@example.com",
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
            print(f"✅ Admin created successfully!", flush=True)
            print(f"   Username: {data.get('username')}", flush=True)
            print(f"   Email: {data.get('email')}", flush=True)
            print(f"   Redirect: {data.get('redirect')}", flush=True)
        else:
            print(f"❌ Admin creation failed: {response.text}", flush=True)
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}", flush=True)

def test_avatar_endpoint():
    print("\n🧪 Testing avatar endpoint...", flush=True)
    
    try:
        response = requests.get('http://localhost:5000/api/admins/testadmin/avatar')
        print(f"📡 Avatar Response Status: {response.status_code}", flush=True)
        print(f"📡 Avatar Response: {response.text}", flush=True)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('avatar'):
                print(f"✅ Avatar found: {data.get('avatar')}", flush=True)
            else:
                print("ℹ️  No avatar set (this is normal for new admins)", flush=True)
        else:
            print(f"❌ Avatar endpoint failed: {response.text}", flush=True)
            
    except Exception as e:
        print(f"❌ Error testing avatar endpoint: {e}", flush=True)

if __name__ == "__main__":
    print("🔧 Test Admin Creation and Avatar Test", flush=True)
    print("=" * 50, flush=True)
    
    create_test_admin()
    test_avatar_endpoint()
    
    print("\n" + "=" * 50, flush=True)
    print("🏁 Test complete!", flush=True) 