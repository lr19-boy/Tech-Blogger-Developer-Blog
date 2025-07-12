import mysql.connector
import json
import os

DB_NAME = 'auth_blog'
JSON_PATH = os.path.join(os.path.dirname(__file__), 'blog.json')

config = {
    'user': 'root',
    'password': '',  # Update if you have a MySQL password
    'host': '127.0.0.1',
    'database': DB_NAME
}

def create_tables(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS authors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            avatarLink VARCHAR(512)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author_id INT,
            date VARCHAR(32),
            title VARCHAR(255),
            tags TEXT,
            summary TEXT,
            reactions INT,
            comments INT,
            readTime VARCHAR(32),
            cover VARCHAR(512),
            FOREIGN KEY (author_id) REFERENCES authors(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT,
            author VARCHAR(255),
            avatar VARCHAR(512),
            text TEXT,
            date VARCHAR(32),
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )
    """)

def main():
    # Connect to MySQL
    cnx = mysql.connector.connect(**config)
    cursor = cnx.cursor()
    create_tables(cursor)

    # Load blog.json
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    posts = data['posts']

    # Insert unique authors
    author_map = {}
    for post in posts:
        name = post['author']['name']
        avatar = post['author']['avatar']
        if name not in author_map:
            cursor.execute("SELECT id FROM authors WHERE name=%s", (name,))
            result = cursor.fetchone()
            if result:
                author_id = result[0]
            else:
                cursor.execute("INSERT INTO authors (name, avatarLink) VALUES (%s, %s)", (name, avatar))
                author_id = cursor.lastrowid
            author_map[name] = author_id

    # Insert posts
    post_id_map = {}
    for post in posts:
        author_id = author_map[post['author']['name']]
        cursor.execute("""
            INSERT INTO posts (author_id, date, title, tags, summary, reactions, comments, readTime, cover)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            author_id,
            post['date'],
            post['title'],
            json.dumps(post['tags']),
            post['summary'],
            post['reactions'],
            post['comments'],
            post['readTime'],
            post['cover']
        ))
        post_id = cursor.lastrowid
        post_id_map[post['id']] = post_id

        # Insert comments for this post
        for comment in post.get('commentsList', []):
            cursor.execute("""
                INSERT INTO comments (post_id, author, avatar, text, date)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                post_id,
                comment['author'],
                comment['avatar'],
                comment['text'],
                comment['date']
            ))

    cnx.commit()
    print("Imported blog.json data into auth_blog database.")
    cursor.close()
    cnx.close()

if __name__ == '__main__':
    main() 