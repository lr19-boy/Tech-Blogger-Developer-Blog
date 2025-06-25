import mysql.connector
from mysql.connector import Error
import json

# MySQL connection configuration
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'auth'
}

def verify_data():
    """Verify that data was inserted correctly"""
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Check authors
        cursor.execute("SELECT COUNT(*) FROM authors")
        authors_count = cursor.fetchone()[0]
        print(f"Authors count: {authors_count}")
        
        # Check posts
        cursor.execute("SELECT COUNT(*) FROM posts")
        posts_count = cursor.fetchone()[0]
        print(f"Posts count: {posts_count}")
        
        # Check comments
        cursor.execute("SELECT COUNT(*) FROM comments")
        comments_count = cursor.fetchone()[0]
        print(f"Comments count: {comments_count}")
        
        # Show some sample data
        if posts_count > 0:
            print("\nSample posts:")
            cursor.execute("SELECT id, title, author_id FROM posts LIMIT 3")
            posts = cursor.fetchall()
            for post in posts:
                print(f"  Post {post[0]}: {post[1]} (Author ID: {post[2]})")
        
        if authors_count > 0:
            print("\nSample authors:")
            cursor.execute("SELECT id, name FROM authors LIMIT 3")
            authors = cursor.fetchall()
            for author in authors:
                print(f"  Author {author[0]}: {author[1]}")
        
    except Error as e:
        print(f"Error verifying data: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    verify_data() 