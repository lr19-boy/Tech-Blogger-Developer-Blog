import sqlite3
import os

DB_PATH = 'auth.db'

def fix_database():
    """Fix database schema issues and ensure all required columns exist"""
    if not os.path.exists(DB_PATH):
        print("Database not found. Please run the main application first to create the database.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔧 Checking and fixing database schema...")
        
        # Check users table
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]
        print(f"Users table columns: {user_columns}")
        
        # Check admins table
        cursor.execute("PRAGMA table_info(admins)")
        admin_columns = [col[1] for col in cursor.fetchall()]
        print(f"Admins table columns: {admin_columns}")
        
        # Add avatar column if it does not exist
        if 'avatar' not in admin_columns:
            print("➕ Adding avatar column to admins table...")
            cursor.execute('ALTER TABLE admins ADD COLUMN avatar TEXT;')
        
        if 'role' not in admin_columns:
            print("➕ Adding role column to admins table...")
            cursor.execute('ALTER TABLE admins ADD COLUMN role TEXT DEFAULT "admin";')
        
        # Add avatar column to users table if it does not exist
        if 'avatar' not in user_columns:
            print("➕ Adding avatar column to users table...")
            cursor.execute('ALTER TABLE users ADD COLUMN avatar TEXT;')
        
        # Add bio column to users table if it does not exist
        if 'bio' not in user_columns:
            print("➕ Adding bio column to users table...")
            cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT;')
        
        # Check if there are any users
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        print(f"Total users in database: {user_count}")
        
        # Check if there are any admins
        cursor.execute('SELECT COUNT(*) FROM admins')
        admin_count = cursor.fetchone()[0]
        print(f"Total admins in database: {admin_count}")
        
        # Show sample users
        cursor.execute('SELECT username, email FROM users LIMIT 5')
        users = cursor.fetchall()
        print("Sample users:")
        for user in users:
            print(f"  - {user[0]} ({user[1]})")
        
        # Show sample admins
        cursor.execute('SELECT username, email, role FROM admins LIMIT 5')
        admins = cursor.fetchall()
        print("Sample admins:")
        for admin in admins:
            print(f"  - {admin[0]} ({admin[1]}) - Role: {admin[2]}")
        
        conn.commit()
        print("✅ Database schema updated successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    fix_database() 