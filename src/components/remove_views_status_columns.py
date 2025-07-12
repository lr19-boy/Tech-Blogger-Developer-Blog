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
    cursor.execute("ALTER TABLE posts DROP COLUMN views;")
    print("Column 'views' removed from posts table.")
except mysql.connector.Error as err:
    print("(If already removed, that's OK) Error removing 'views':", err)

try:
    cursor.execute("ALTER TABLE posts DROP COLUMN status;")
    print("Column 'status' removed from posts table.")
except mysql.connector.Error as err:
    print("(If already removed, that's OK) Error removing 'status':", err)

cursor.close()
conn.close()
print("Columns removal complete.") 