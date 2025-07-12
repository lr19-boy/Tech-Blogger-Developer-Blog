import mysql.connector

config = {
    'user': 'root',
    'password': '',  # Update if you have a MySQL password
    'host': '127.0.0.1',
    'database': 'auth_blog'
}

conn = mysql.connector.connect(**config)
cursor = conn.cursor()

# Add 'views' column to posts table
try:
    cursor.execute("ALTER TABLE posts ADD COLUMN views INT DEFAULT 0;")
    print("Column 'views' added to posts table.")
except mysql.connector.Error as err:
    print("(If already exists, that's OK) Error adding 'views':", err)

# Add 'status' column to posts table
try:
    cursor.execute("ALTER TABLE posts ADD COLUMN status VARCHAR(32) DEFAULT 'published';")
    print("Column 'status' added to posts table.")
except mysql.connector.Error as err:
    print("(If already exists, that's OK) Error adding 'status':", err)

# Create followers table
try:
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
    print("Table 'followers' created.")
except mysql.connector.Error as err:
    print("Error creating 'followers' table:", err)

cursor.close()
conn.close()
print("Migration complete.") 