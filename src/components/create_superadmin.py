import sqlite3
import os

DB_PATH = 'auth.db'

def create_superadmin():
    """Create the first super admin if no admins exist"""
    if not os.path.exists(DB_PATH):
        print("Database not found. Please run the main application first to create the database.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if any admins exist
        cursor.execute('SELECT COUNT(*) FROM admins')
        admin_count = cursor.fetchone()[0]
        
        if admin_count == 0:
            # Create the first super admin
            superadmin_username = 'superadmin'
            superadmin_email = 'superadmin@example.com'
            superadmin_password = 'superadmin123'  # Change this in production
            
            cursor.execute('''
                INSERT INTO admins (username, email, password, role) 
                VALUES (?, ?, ?, ?)
            ''', (superadmin_username, superadmin_email, superadmin_password, 'superadmin'))
            
            conn.commit()
            print("✅ Super admin created successfully!")
            print(f"Username: {superadmin_username}")
            print(f"Email: {superadmin_email}")
            print(f"Password: {superadmin_password}")
            print("\n⚠️  IMPORTANT: Change the password after first login!")
        else:
            # Check if any super admin exists
            cursor.execute('SELECT COUNT(*) FROM admins WHERE role = ?', ('superadmin',))
            superadmin_count = cursor.fetchone()[0]
            
            if superadmin_count == 0:
                # Update the first admin to be super admin
                cursor.execute('UPDATE admins SET role = ? WHERE id = (SELECT MIN(id) FROM admins)', ('superadmin',))
                conn.commit()
                print("✅ First admin promoted to super admin!")
            else:
                print("Super admin already exists.")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    create_superadmin() 