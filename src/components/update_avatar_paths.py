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
    cursor.execute("SELECT id, avatar FROM authors WHERE avatar NOT LIKE 'http%'")
    rows = cursor.fetchall()
    for author_id, avatar in rows:
        if avatar.startswith('../'):
            filename = avatar.split('../')[-1]
            new_path = f'/uploads/avatars/{filename}'
            cursor.execute("UPDATE authors SET avatar = %s WHERE id = %s", (new_path, author_id))
            print(f"Updated author id {author_id}: {avatar} -> {new_path}")
    conn.commit()
    print("Local avatar paths updated.")
except mysql.connector.Error as err:
    print("Error updating avatar paths:", err)
finally:
    cursor.close()
    conn.close() 