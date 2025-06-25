import mysql.connector
from mysql.connector import Error

# MySQL connection configuration
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'auth'
}

def check_avatars():
    """Check the current avatar paths in the database"""
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Only fetch the relevant authors
        cursor.execute("SELECT name, avatar FROM authors WHERE name IN (%s, %s, %s, %s, %s)", (
            'Jeeva.jpg', 'Kishore.jpg', 'Lalitha.jpg', 'Rolando.jpg', 'Lingesh.jpg'))
        authors = cursor.fetchall()
        
        print("Relevant author avatars:")
        for name, avatar in authors:
            print(f"  {name}: {avatar}")
        
    except Error as e:
        print(f"Error checking avatars: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_avatars() 