#!/usr/bin/env python3
import requests
import json
import sqlite3
import os

def test_avatar_upload():
    print("🧪 Testing Avatar Upload Functionality", flush=True)
    print("=" * 50, flush=True)
    
    # Test admin credentials
    admin_username = "testadmin123"
    admin_email = "testadmin123@example.com"
    admin_password = "testpass123"
    
    # Step 1: Create test admin if not exists
    print("1️⃣ Creating test admin...", flush=True)
    signup_data = {
        "isLogin": False,
        "username": admin_username,
        "email": admin_email,
        "password": admin_password,
        "is_user": False
    }
    
    try:
        response = requests.post('http://localhost:5000/auth', 
                               json=signup_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 201:
            print("✅ Admin created successfully", flush=True)
        elif response.status_code == 400:
            print("ℹ️  Admin already exists", flush=True)
        else:
            print(f"❌ Admin creation failed: {response.text}", flush=True)
            return
    except Exception as e:
        print(f"❌ Error creating admin: {e}", flush=True)
        return
    
    # Step 2: Check current avatar
    print("\n2️⃣ Checking current avatar...", flush=True)
    try:
        response = requests.get(f'http://localhost:5000/api/admins/{admin_username}/avatar')
        if response.status_code == 200:
            data = response.json()
            if data.get('avatar'):
                print(f"✅ Current avatar: {data.get('avatar')}", flush=True)
            else:
                print("ℹ️  No avatar currently set", flush=True)
        else:
            print(f"❌ Error checking avatar: {response.text}", flush=True)
    except Exception as e:
        print(f"❌ Error checking avatar: {e}", flush=True)
    
    # Step 3: Test avatar upload endpoint
    print("\n3️⃣ Testing avatar upload endpoint...", flush=True)
    
    # Create a simple test image (1x1 pixel PNG)
    test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\xd7\xd4\xc5\x00\x00\x00\x00IEND\xaeB`\x82'
    
    try:
        files = {'avatar': ('test_avatar.png', test_image_content, 'image/png')}
        data = {'username': admin_username}
        
        response = requests.post('http://localhost:5000/api/admin/avatar', 
                               files=files, 
                               data=data)
        
        print(f"📡 Upload Response Status: {response.status_code}", flush=True)
        print(f"📡 Upload Response: {response.text}", flush=True)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Avatar upload successful!", flush=True)
            print(f"   Avatar URL: {data.get('avatarUrl')}", flush=True)
            
            # Step 4: Verify avatar was saved
            print("\n4️⃣ Verifying avatar was saved...", flush=True)
            
            # Check database
            conn = sqlite3.connect('auth.db')
            cursor = conn.cursor()
            cursor.execute('SELECT avatar FROM admins WHERE username = ?', (admin_username,))
            result = cursor.fetchone()
            conn.close()
            
            if result and result[0]:
                print(f"✅ Avatar saved in database: {result[0]}", flush=True)
                
                # Check if file exists
                file_path = os.path.join('uploads', 'avatars', result[0])
                if os.path.exists(file_path):
                    print(f"✅ Avatar file exists: {file_path}", flush=True)
                else:
                    print(f"❌ Avatar file not found: {file_path}", flush=True)
            else:
                print("❌ Avatar not found in database", flush=True)
                
        else:
            print(f"❌ Avatar upload failed: {response.text}", flush=True)
            
    except Exception as e:
        print(f"❌ Error testing avatar upload: {e}", flush=True)
    
    print("\n" + "=" * 50, flush=True)
    print("🏁 Avatar upload test complete!", flush=True)

if __name__ == "__main__":
    test_avatar_upload() 