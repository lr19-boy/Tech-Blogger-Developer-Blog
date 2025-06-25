import mysql.connector
from mysql.connector import Error

def create_database():
    """Create the auth database if it doesn't exist"""
    try:
        # Connect without specifying database
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=''
        )
        cursor = connection.cursor()
        
        # Create database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS auth")
        print("Database 'auth' created successfully!")
        
    except Error as e:
        print(f"Error creating database: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_database() 