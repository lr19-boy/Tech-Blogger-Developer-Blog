#!/usr/bin/env python3
"""
Test script to verify the avatar system is working correctly.
"""

import requests
import sqlite3
import os

BASE_URL = "http://localhost:5000"
DB_PATH = "auth.db"

def test_avatar_endpoints():
    """Test avatar-related endpoints"""
    print("🧪 Testing Avatar System")
    print("=" * 40)
    
    # Test 1: Check if uploads directory exists
    uploads_dir = "uploads/avatars"
    if os.path.exists(uploads_dir):
        print(f"✅ Uploads directory exists: {uploads_dir}")
        files = os.listdir(uploads_dir)
        print(f"   Files in directory: {files}")
    else:
        print(f"❌ Uploads directory missing: {uploads_dir}")
        os.makedirs(uploads_dir, exist_ok=True)
        print(f"✅ Created uploads directory: {uploads_dir}")
    
    # Test 2: Check admin avatar endpoint
    print("\n📋 Testing admin avatar endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/admins/test_admin/avatar")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 3: Check avatar serving endpoint
    print("\n📋 Testing avatar serving endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/uploads/avatars/test.jpg")
        print(f"   Status: {response.status_code}")
        if response.status_code == 404:
            print("   Expected 404 for non-existent file")
        else:
            print(f"   Response length: {len(response.content)} bytes")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 4: Check database for avatar records
    print("\n📋 Checking database for avatar records...")
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT username, avatar FROM admins WHERE avatar IS NOT NULL")
            admins_with_avatars = cursor.fetchall()
            print(f"   Admins with avatars: {len(admins_with_avatars)}")
            for admin in admins_with_avatars:
                print(f"   - {admin[0]}: {admin[1]}")
    except Exception as e:
        print(f"   ❌ Database error: {str(e)}")

def test_avatar_upload_simulation():
    """Simulate avatar upload process"""
    print("\n🔄 Testing Avatar Upload Simulation")
    print("=" * 40)
    
    # Create a test image file
    test_image_path = "test_avatar.jpg"
    test_image_content = b"fake image content"
    
    try:
        with open(test_image_path, "wb") as f:
            f.write(test_image_content)
        
        print(f"✅ Created test image: {test_image_path}")
        
        # Test upload endpoint
        with open(test_image_path, "rb") as f:
            files = {"avatar": f}
            data = {"username": "test_admin"}
            
            response = requests.post(f"{BASE_URL}/api/admin/avatar", files=files, data=data)
            print(f"📤 Upload response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload successful: {result}")
            else:
                print(f"❌ Upload failed: {response.text}")
        
        # Clean up test file
        os.remove(test_image_path)
        print(f"🧹 Cleaned up test file: {test_image_path}")
        
    except Exception as e:
        print(f"❌ Upload simulation error: {str(e)}")

def main():
    """Main test function"""
    print("🚀 Avatar System Test Suite")
    print("=" * 50)
    
    try:
        test_avatar_endpoints()
        test_avatar_upload_simulation()
        print("\n🎉 Avatar system tests completed!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    main() 