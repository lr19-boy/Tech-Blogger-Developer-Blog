import mysql.connector
from mysql.connector import Error

# MySQL connection configuration
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'auth'
}

def fix_avatars():
    """Fix the avatar paths in the database to use proper URLs"""
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Define the correct avatar paths for use with React public folder
        avatar_updates = [
            ("Rolando", "/lazarus.jpg"),
            ("Kishore", "/kishore.jpg"),
            ("Lingesh", "/lingesh.jpg"),
            ("Jeeva", "/jeeva.jpg"),
            ("Lalitha", "/lalitha.jpg"),
        ]
        
        # Update each author's avatar
        for author_name, new_avatar in avatar_updates:
            cursor.execute(
                "UPDATE authors SET avatar = %s WHERE name = %s",
                (new_avatar, author_name)
            )
            print(f"Updated {author_name}'s avatar to: {new_avatar}")
        
        connection.commit()
        print("\nAvatar updates completed!")
        
        # Show the updated avatars
        print("\nUpdated author avatars:")
        cursor.execute("SELECT id, name, avatar FROM authors ORDER BY id")
        authors = cursor.fetchall()
        for author in authors:
            print(f"  Author {author[0]} ({author[1]}): {author[2]}")
        
    except Error as e:
        print(f"Error fixing avatars: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    fix_avatars() 