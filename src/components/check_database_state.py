#!/usr/bin/env python3
import sqlite3

def check_database_state():
    print("🔍 Checking current database state...", flush=True)
    try:
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()
        
        # Check admins table
        cursor.execute('SELECT username, email, role, created_at FROM admins')
        admins = cursor.fetchall()
        print(f"📊 Admins table ({len(admins)} records):", flush=True)
        for admin in admins:
            print(f"  - {admin[0]} ({admin[1]}) - Role: {admin[2]} - Created: {admin[3]}", flush=True)
        
        # Check users table
        cursor.execute('SELECT username, email, is_user, created_at FROM users')
        users = cursor.fetchall()
        print(f"\n📊 Users table ({len(users)} records):", flush=True)
        for user in users:
            user_type = "User" if user[2] else "Admin"
            print(f"  - {user[0]} ({user[1]}) - Type: {user_type} - Created: {user[3]}", flush=True)
        
        # Check for admins in users table
        cursor.execute('SELECT username, email, created_at FROM users WHERE is_user = 0')
        admin_users = cursor.fetchall()
        if admin_users:
            print(f"\n⚠️  Found {len(admin_users)} admin(s) in users table:", flush=True)
            for admin_user in admin_users:
                print(f"  - {admin_user[0]} ({admin_user[1]}) - Created: {admin_user[2]}", flush=True)
        else:
            print(f"\n✅ No admins found in users table", flush=True)
        
        conn.close()
    except Exception as e:
        print(f"❌ Error checking database: {e}", flush=True)

if __name__ == "__main__":
    check_database_state() 