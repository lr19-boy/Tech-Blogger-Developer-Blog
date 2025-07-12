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
    cursor.execute("ALTER TABLE posts ADD COLUMN read_time VARCHAR(32);")
    print("Column 'read_time' added successfully.")
except mysql.connector.Error as err:
    print("Error:", err)
finally:
    cursor.close()
    conn.close() 