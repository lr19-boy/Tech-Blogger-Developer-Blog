import requests
import json
import time

def test_complete_admin_flow():
    """Test the complete admin signup and access flow"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Complete Admin Signup and Access Flow")
    
    # Step 1: Admin Signup
    try:
        print("\n1. Testing Admin Signup")
        signup_data = {
            "isLogin": False,
            "username": "flowtestadmin",
            "email": "flowtestadmin@example.com",
            "password": "flowtest123",
            "is_user": False
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
                return False
        else:
            print(f"   ❌ Admin signup failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Step 2: Admin Login
    try:
        print("\n2. Testing Admin Login")
        login_data = {
            "isLogin": True,
            "username": "flowtestadmin",
            "email": "flowtestadmin@example.com",
            "password": "flowtest123",
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
                return False
        else:
            print(f"   ❌ Admin login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Step 3: Admin Authentication Check
    try:
        print("\n3. Testing Admin Authentication Check")
        auth_data = {
            "username": "flowtestadmin"
        }
        
        response = requests.post(
            f"{base_url}/auth/admin",
            headers={"Content-Type": "application/json"},
            data=json.dumps(auth_data)
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Admin authentication successful!")
            print(f"   Username: {data.get('username')}")
            print(f"   Email: {data.get('email')}")
            print(f"   Role: {data.get('role')}")
            print(f"   Is Admin: {data.get('is_admin')}")
            
            if data.get('is_admin') == True:
                print("   ✅ Correctly identified as admin")
            else:
                print(f"   ❌ Not identified as admin: {data.get('is_admin')}")
                return False
        else:
            print(f"   ❌ Admin authentication failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Step 4: Check if admin appears in admins list
    try:
        print("\n4. Testing Admin List")
        response = requests.get(f"{base_url}/api/admins")
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            admins = response.json()
            print(f"   ✅ Admin list retrieved successfully!")
            print(f"   Total admins: {len(admins)}")
            
            # Check if our test admin is in the list
            test_admin = next((admin for admin in admins if admin['username'] == 'flowtestadmin'), None)
            if test_admin:
                print(f"   ✅ Test admin found in list!")
                print(f"   Admin details: {test_admin}")
            else:
                print(f"   ❌ Test admin not found in list")
                return False
        else:
            print(f"   ❌ Admin list failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    print("\n🎉 All tests passed! Admin signup and access flow is working correctly.")
    return True

if __name__ == '__main__':
    test_complete_admin_flow() 