#!/usr/bin/env python3
import sqlite3

def check_admin_exists():
    print("🔍 Checking if 'testadmin' exists in database...", flush=True)
    try:
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()
        
        # Check admins table
        cursor.execute('SELECT username, email, role, avatar FROM admins WHERE username = ?', ('testadmin',))
        admin = cursor.fetchone()
        
        if admin:
            print(f"✅ Admin found: {admin[0]} ({admin[1]}) - Role: {admin[2]} - Avatar: {admin[3]}", flush=True)
        else:
            print("❌ Admin 'testadmin' not found in admins table", flush=True)
        
        # Check users table too
        cursor.execute('SELECT username, email, is_user FROM users WHERE username = ?', ('testadmin',))
        user = cursor.fetchone()
        
        if user:
            user_type = "User" if user[2] else "Admin"
            print(f"⚠️  Found in users table: {user[0]} ({user[1]}) - Type: {user_type}", flush=True)
        else:
            print("ℹ️  Not found in users table either", flush=True)
        
        conn.close()
    except Exception as e:
        print(f"❌ Error checking database: {e}", flush=True)

if __name__ == "__main__":
    check_admin_exists() 