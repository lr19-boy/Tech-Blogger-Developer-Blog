#!/usr/bin/env python3
"""
Test script for role-based permissions in the TechBlogger admin system.
This script tests the permission system for different admin roles.
"""

import requests
import json
import sqlite3
import os

BASE_URL = "http://localhost:5000"
DB_PATH = "auth.db"

def init_test_data():
    """Initialize test data with different admin roles"""
    print("🔧 Setting up test data...")
    
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Clear existing test admins
        cursor.execute("DELETE FROM admins WHERE username IN ('superadmin_test', 'admin_test', 'readonly_test')")
        
        # Create test admins with different roles
        test_admins = [
            ('superadmin_test', 'super@test.com', 'password123', 'superadmin'),
            ('admin_test', 'admin@test.com', 'password123', 'admin'),
            ('readonly_test', 'readonly@test.com', 'password123', 'readonly')
        ]
        
        for username, email, password, role in test_admins:
            cursor.execute(
                "INSERT INTO admins (username, email, password, role, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
                (username, email, password, role)
            )
        
        conn.commit()
        print("✅ Test data initialized")

def test_permission_endpoint(endpoint, method="GET", data=None, admin_username=None, expected_status=200):
    """Test an endpoint with role-based permissions"""
    headers = {"Content-Type": "application/json"}
    if admin_username:
        headers["x-admin-username"] = admin_username
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        status = response.status_code
        result = response.json() if response.content else {}
        
        if status == expected_status:
            print(f"✅ {method} {endpoint} - {admin_username or 'No auth'} - Status: {status}")
            return True
        else:
            print(f"❌ {method} {endpoint} - {admin_username or 'No auth'} - Expected: {expected_status}, Got: {status}")
            if result.get('error'):
                print(f"   Error: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ {method} {endpoint} - {admin_username or 'No auth'} - Exception: {str(e)}")
        return False

def test_role_permissions():
    """Test role-based permissions for different endpoints"""
    print("\n🧪 Testing Role-Based Permissions")
    print("=" * 50)
    
    # Test data for requests
    test_user = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "password123"
    }
    
    test_admin = {
        "username": "newadmin",
        "email": "newadmin@example.com",
        "password": "password123"
    }
    
    # Test endpoints that require different permission levels
    test_cases = [
        # Endpoint, Method, Data, Required Role, Description
        ("/api/users", "GET", None, "readonly", "View users"),
        ("/api/admins", "GET", None, "readonly", "View admins"),
        ("/api/users", "POST", test_user, "admin", "Create user"),
        ("/api/admins", "POST", test_admin, "admin", "Create admin"),
        ("/api/admins/1/role", "PUT", {"role": "admin"}, "superadmin", "Update admin role"),
    ]
    
    admin_roles = ["superadmin_test", "admin_test", "readonly_test"]
    
    for endpoint, method, data, required_role, description in test_cases:
        print(f"\n📋 Testing: {description}")
        print(f"   Endpoint: {method} {endpoint}")
        print(f"   Required Role: {required_role}")
        
        for admin_username in admin_roles:
            # Determine expected status based on role hierarchy
            role_hierarchy = {"superadmin": 3, "admin": 2, "readonly": 1}
            admin_role = admin_username.split('_')[0]  # Extract role from username
            required_level = role_hierarchy.get(required_role, 0)
            admin_level = role_hierarchy.get(admin_role, 0)
            
            expected_status = 200 if admin_level >= required_level else 403
            
            test_permission_endpoint(endpoint, method, data, admin_username, expected_status)

def test_specific_permissions():
    """Test specific permission scenarios"""
    print("\n🎯 Testing Specific Permission Scenarios")
    print("=" * 50)
    
    # Test 1: Readonly admin trying to create user (should fail)
    print("\n1️⃣ Readonly admin trying to create user:")
    test_permission_endpoint(
        "/api/users", 
        "POST", 
        {"username": "testuser1", "email": "test1@example.com", "password": "pass123"},
        "readonly_test",
        403
    )
    
    # Test 2: Admin trying to create user (should succeed)
    print("\n2️⃣ Admin trying to create user:")
    test_permission_endpoint(
        "/api/users", 
        "POST", 
        {"username": "testuser2", "email": "test2@example.com", "password": "pass123"},
        "admin_test",
        201
    )
    
    # Test 3: Admin trying to update admin role (should fail)
    print("\n3️⃣ Admin trying to update admin role:")
    test_permission_endpoint(
        "/api/admins/1/role", 
        "PUT", 
        {"role": "admin"},
        "admin_test",
        403
    )
    
    # Test 4: Super admin trying to update admin role (should succeed)
    print("\n4️⃣ Super admin trying to update admin role:")
    test_permission_endpoint(
        "/api/admins/1/role", 
        "PUT", 
        {"role": "admin"},
        "superadmin_test",
        200
    )
    
    # Test 5: No authentication (should fail)
    print("\n5️⃣ No authentication:")
    test_permission_endpoint(
        "/api/users", 
        "POST", 
        {"username": "testuser3", "email": "test3@example.com", "password": "pass123"},
        None,
        401
    )

def cleanup_test_data():
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")
    
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Remove test admins
        cursor.execute("DELETE FROM admins WHERE username IN ('superadmin_test', 'admin_test', 'readonly_test')")
        
        # Remove test users
        cursor.execute("DELETE FROM users WHERE username LIKE 'testuser%'")
        
        conn.commit()
        print("✅ Test data cleaned up")

def main():
    """Main test function"""
    print("🚀 Role-Based Permission Test Suite")
    print("=" * 50)
    
    try:
        # Initialize test data
        init_test_data()
        
        # Test role permissions
        test_role_permissions()
        
        # Test specific scenarios
        test_specific_permissions()
        
        print("\n🎉 All tests completed!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
    
    finally:
        # Clean up
        cleanup_test_data()

if __name__ == "__main__":
    main() 