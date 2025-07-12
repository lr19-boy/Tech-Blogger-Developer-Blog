import mysql.connector

config = {
    'user': 'root',
    'password': '',
    'host': '127.0.0.1',
    'database': 'auth_blog'
}

try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    # Create notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            from_user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES authors(id),
            FOREIGN KEY (from_user_id) REFERENCES authors(id)
        )
    ''')
    
    print("✅ Notifications table created successfully!")
    
    # Check if table exists and show structure
    cursor.execute("DESCRIBE notifications")
    columns = cursor.fetchall()
    print("\n📋 Notifications table structure:")
    for col in columns:
        print(f"  - {col[0]} ({col[1]})")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error creating notifications table: {e}") 