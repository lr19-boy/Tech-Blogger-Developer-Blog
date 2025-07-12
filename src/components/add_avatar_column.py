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
    cursor.execute("ALTER TABLE authors ADD COLUMN avatar VARCHAR(512);")
    print("Column 'avatar' added successfully.")
except mysql.connector.Error as err:
    print("(If already exists, that's OK) Error:", err)
try:
    cursor.execute("UPDATE authors SET avatar = avatarLink;")
    print("Copied data from 'avatarLink' to 'avatar'.")
except mysql.connector.Error as err:
    print("Error copying data:", err)
finally:
    cursor.close()
    conn.close() 