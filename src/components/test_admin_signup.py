import requests
import json

def test_admin_signup():
    """Test admin signup functionality"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Admin Signup Functionality")
    
    # Test admin signup
    try:
        print("\n1. Testing Admin Signup")
        signup_data = {
            "isLogin": False,
            "username": "testadmin",
            "email": "testadmin@example.com",
            "password": "testpass123",
            "is_user": False  # This should create an admin
        }
        
        response = requests.post(
            f"{base_url}/auth",
            headers={"Content-Type": "application/json"},
            data=json.dumps(signup_data)
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Admin signup successful!")
            print(f"   Username: {data.get('username')}")
            print(f"   Email: {data.get('email')}")
            print(f"   Is User: {data.get('is_user')}")
            print(f"   Redirect: {data.get('redirect')}")
            
            if data.get('redirect') == '/admin':
                print("   ✅ Correctly redirecting to admin area")
            else:
                print(f"   ❌ Wrong redirect: expected '/admin', got '{data.get('redirect')}'")
        else:
            print(f"   ❌ Admin signup failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection Error: Make sure the backend server is running on port 5000")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test admin login
    try:
        print("\n2. Testing Admin Login")
        login_data = {
            "isLogin": True,
            "username": "testadmin",
            "email": "testadmin@example.com",
            "password": "testpass123",
            "is_user": False
        }
        
        response = requests.post(
            f"{base_url}/auth",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data)
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Admin login successful!")
            print(f"   Username: {data.get('username')}")
            print(f"   Email: {data.get('email')}")
            print(f"   Is User: {data.get('is_user')}")
            print(f"   Redirect: {data.get('redirect')}")
            
            if data.get('redirect') == '/admin':
                print("   ✅ Correctly redirecting to admin area")
            else:
                print(f"   ❌ Wrong redirect: expected '/admin', got '{data.get('redirect')}'")
        else:
            print(f"   ❌ Admin login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection Error: Make sure the backend server is running on port 5000")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test user signup for comparison
    try:
        print("\n3. Testing User Signup (for comparison)")
        signup_data = {
            "isLogin": False,
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "testpass123",
            "is_user": True  # This should create a user
        }
        
        response = requests.post(
            f"{base_url}/auth",
            headers={"Content-Type": "application/json"},
            data=json.dumps(signup_data)
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ User signup successful!")
            print(f"   Username: {data.get('username')}")
            print(f"   Email: {data.get('email')}")
            print(f"   Is User: {data.get('is_user')}")
            print(f"   Redirect: {data.get('redirect')}")
            
            if data.get('redirect') == '/user':
                print("   ✅ Correctly redirecting to user area")
            else:
                print(f"   ❌ Wrong redirect: expected '/user', got '{data.get('redirect')}'")
        else:
            print(f"   ❌ User signup failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection Error: Make sure the backend server is running on port 5000")
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == '__main__':
    test_admin_signup() 