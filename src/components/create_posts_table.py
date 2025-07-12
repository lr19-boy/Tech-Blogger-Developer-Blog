import mysql.connector

config = {
    'user': 'root',
    'password': '',  # Update if you have a MySQL password
    'host': '127.0.0.1',
    'database': 'auth_blog'
}

conn = mysql.connector.connect(**config)
cursor = conn.cursor()

try:
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author_id INT,
            date VARCHAR(32),
            title VARCHAR(255),
            tags TEXT,
            summary TEXT,
            reactions INT DEFAULT 0,
            comments INT DEFAULT 0,
            readTime VARCHAR(32),
            cover VARCHAR(512),
            views INT DEFAULT 0,
            status VARCHAR(32) DEFAULT 'published',
            FOREIGN KEY (author_id) REFERENCES authors(id)
        )
    ''')
    print("Table 'posts' created successfully.")
except mysql.connector.Error as err:
    print("Error creating 'posts' table:", err)

cursor.close()
conn.close() 