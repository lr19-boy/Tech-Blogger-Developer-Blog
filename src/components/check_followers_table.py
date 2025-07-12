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
    
    # Check all tables
    cursor.execute('SHOW TABLES')
    tables = cursor.fetchall()
    print("All tables:", [table[0] for table in tables])
    
    # Check if followers table exists
    cursor.execute('SHOW TABLES LIKE "followers"')
    followers_exists = cursor.fetchone()
    print("Followers table exists:", followers_exists is not None)
    
    if followers_exists:
        # Check table structure
        cursor.execute('DESCRIBE followers')
        columns = cursor.fetchall()
        print("Followers table columns:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
        
        # Check if table has data
        cursor.execute('SELECT COUNT(*) FROM followers')
        count = cursor.fetchone()[0]
        print(f"Followers table has {count} records")
    else:
        print("Creating followers table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS followers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                author_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES authors(id),
                FOREIGN KEY (author_id) REFERENCES authors(id)
            )
        ''')
        conn.commit()
        print("Followers table created successfully!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}") 