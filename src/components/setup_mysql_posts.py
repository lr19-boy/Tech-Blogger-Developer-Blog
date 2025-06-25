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

def create_tables():
    """Create the necessary tables for blog posts"""
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Create authors table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS authors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                avatar VARCHAR(500)
            )
        ''')
        
        # Create posts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                author_id INT,
                date VARCHAR(50),
                title VARCHAR(500) NOT NULL,
                tags TEXT,
                summary TEXT,
                reactions INT DEFAULT 0,
                comments INT DEFAULT 0,
                read_time VARCHAR(50),
                cover VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES authors(id)
            )
        ''')
        
        # Create comments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT,
                author VARCHAR(255),
                avatar VARCHAR(500),
                text TEXT,
                date VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id)
            )
        ''')
        
        connection.commit()
        print("Tables created successfully!")
        
    except Error as e:
        print(f"Error creating tables: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def insert_authors():
    """Insert authors data"""
    authors_data = [
        ("Rolando", "../lazarus.jpg"),
        ("Lina", "https://randomuser.me/api/portraits/women/44.jpg"),
        ("Kishore", "../kishore.jpg"),
        ("Lingesh", "../lingesh.jpg"),
        ("Anu", "https://randomuser.me/api/portraits/women/44.jpg"),
        ("Jeeva", "../jeeva.jpg"),
        ("Lalitha", "../lalitha.jpg"),
        ("Raj", "https://randomuser.me/api/portraits/men/53.jpg")
    ]
    
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Clear existing authors
        cursor.execute("DELETE FROM authors")
        
        # Insert authors
        for author in authors_data:
            cursor.execute(
                "INSERT INTO authors (name, avatar) VALUES (%s, %s)",
                author
            )
        
        connection.commit()
        print("Authors inserted successfully!")
        
    except Error as e:
        print(f"Error inserting authors: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def insert_posts():
    """Insert posts data"""
    posts_data = [
        {
            "author_name": "Rolando",
            "date": "May 28",
            "title": "AI-Powered Development: The Future of Coding",
            "tags": ["#ai", "#programming", "#future"],
            "summary": "Discover how AI is revolutionizing software development with code completion, bug detection, and automated testing. Learn about the latest AI tools and how they're changing the way we write code.",
            "reactions": 45,
            "comments": 12,
            "read_time": "5 min read",
            "cover": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
        },
        {
            "author_name": "Lina",
            "date": "May 28",
            "title": "Mastering TypeScript: Advanced Types and Design Patterns",
            "tags": ["#typescript", "#javascript", "#programming"],
            "summary": "Deep dive into TypeScript's advanced features. Learn about utility types, decorators, and how to implement common design patterns in TypeScript for better code organization.",
            "reactions": 38,
            "comments": 15,
            "read_time": "7 min read",
            "cover": "https://images.unsplash.com/photo-1619410283995-43d9134e7656"
        },
        {
            "author_name": "Kishore",
            "date": "May 25",
            "title": "Understanding React Server Components",
            "tags": ["#react", "#webdev", "#frontend"],
            "summary": "A deep dive into React Server Components and how they change the way we build apps.",
            "reactions": 18,
            "comments": 5,
            "read_time": "4 min read",
            "cover": "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "author_name": "Lingesh",
            "date": "May 24",
            "title": "The Evolution of CSS: From Cascading Styles to CSS Grid",
            "tags": ["#css", "#webdev", "#design"],
            "summary": "Explore the evolution of CSS and how it has transformed web design. Learn about the latest features like CSS Grid and Flexbox, and how to use them effectively.",
            "reactions": 27,
            "comments": 10,
            "read_time": "6 min read",
            "cover": "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "author_name": "Anu",
            "date": "May 23",
            "title": "Getting Started with Docker: A Beginner's Guide",
            "tags": ["#docker", "#devops", "#containers"],
            "summary": "Learn the basics of Docker and containerization. This guide covers Docker installation, basic commands, and how to create your first container.",
            "reactions": 33,
            "comments": 8,
            "read_time": "5 min read",
            "cover": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
        },
        {
            "author_name": "Jeeva",
            "date": "May 25",
            "title": "Web Performance Optimization Techniques for 2025",
            "tags": ["#performance", "#webdev", "#optimization"],
            "summary": "Learn the latest techniques for optimizing web applications. From code splitting to lazy loading, discover how to make your web apps blazing fast in 2025.",
            "reactions": 56,
            "comments": 18,
            "read_time": "6 min read",
            "cover": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "author_name": "Lalitha",
            "date": "May 24",
            "title": "Machine Learning for Web Developers",
            "tags": ["#ml", "#webdev", "#tutorial"],
            "summary": "A beginner-friendly guide to implementing machine learning in web applications. Learn how to use TensorFlow.js and integrate ML models in your web projects.",
            "reactions": 42,
            "comments": 14,
            "read_time": "8 min read",
            "cover": "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "author_name": "Raj",
            "date": "May 24",
            "title": "Building Accessible Web Applications",
            "tags": ["#accessibility", "#webdev", "#a11y"],
            "summary": "Learn how to make your web applications accessible to everyone. Best practices, ARIA attributes, and testing tools for better web accessibility.",
            "reactions": 35,
            "comments": 9,
            "read_time": "4 min read",
            "cover": "https://images.unsplash.com/photo-1584433305355-9cb73387fc61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    ]
    
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Clear existing posts
        cursor.execute("DELETE FROM posts")
        
        # Insert posts
        for post in posts_data:
            # Get author_id
            cursor.execute("SELECT id FROM authors WHERE name = %s", (post["author_name"],))
            author_result = cursor.fetchone()
            if author_result:
                author_id = author_result[0]
                
                cursor.execute('''
                    INSERT INTO posts (author_id, date, title, tags, summary, reactions, comments, read_time, cover)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    author_id,
                    post["date"],
                    post["title"],
                    json.dumps(post["tags"]),  # Convert list to JSON string
                    post["summary"],
                    post["reactions"],
                    post["comments"],
                    post["read_time"],
                    post["cover"]
                ))
        
        connection.commit()
        print("Posts inserted successfully!")
        
    except Error as e:
        print(f"Error inserting posts: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def insert_comments():
    """Insert comments data"""
    comments_data = [
        # Post 1 comments
        {"post_id": 1, "author": "Riya", "avatar": "https://randomuser.me/api/portraits/women/42.jpg", "text": "AI has definitely made my coding faster!", "date": "May 28"},
        {"post_id": 1, "author": "Tom", "avatar": "https://randomuser.me/api/portraits/men/43.jpg", "text": "Great insights on the future of development.", "date": "May 28"},
        
        # Post 2 comments
        {"post_id": 2, "author": "Alex", "avatar": "https://randomuser.me/api/portraits/men/45.jpg", "text": "This helped me understand TypeScript better!", "date": "May 28"},
        {"post_id": 2, "author": "Sarah", "avatar": "https://randomuser.me/api/portraits/women/46.jpg", "text": "Love the design patterns section.", "date": "May 28"},
        
        # Post 3 comments
        {"post_id": 3, "author": "Alex", "avatar": "https://randomuser.me/api/portraits/men/54.jpg", "text": "Nice overview!", "date": "May 25"},
        {"post_id": 3, "author": "Sara", "avatar": "https://randomuser.me/api/portraits/women/55.jpg", "text": "Looking forward to more.", "date": "May 25"},
        
        # Post 4 comments
        {"post_id": 4, "author": "Mike", "avatar": "https://randomuser.me/api/portraits/men/48.jpg", "text": "CSS Grid has changed the way I build layouts.", "date": "May 24"},
        {"post_id": 4, "author": "Emma", "avatar": "https://randomuser.me/api/portraits/women/49.jpg", "text": "Great insights on CSS evolution.", "date": "May 24"},
        
        # Post 5 comments
        {"post_id": 5, "author": "Sam", "avatar": "https://randomuser.me/api/portraits/men/53.jpg", "text": "Docker has simplified my development workflow.", "date": "May 23"},
        {"post_id": 5, "author": "Samantha", "avatar": "https://randomuser.me/api/portraits/women/52.jpg", "text": "Clear and concise guide, thanks!", "date": "May 23"},
        
        # Post 6 comments
        {"post_id": 6, "author": "Mike", "avatar": "https://randomuser.me/api/portraits/men/48.jpg", "text": "These tips improved my site's performance significantly!", "date": "May 25"},
        {"post_id": 6, "author": "Lisa", "avatar": "https://randomuser.me/api/portraits/women/49.jpg", "text": "Great article on modern optimization techniques.", "date": "May 25"},
        
        # Post 7 comments
        {"post_id": 7, "author": "David", "avatar": "https://randomuser.me/api/portraits/men/51.jpg", "text": "Great introduction to ML for web devs!", "date": "May 24"},
        {"post_id": 7, "author": "Emma", "avatar": "https://randomuser.me/api/portraits/women/52.jpg", "text": "Can't wait to try these techniques.", "date": "May 24"},
        
        # Post 8 comments
        {"post_id": 8, "author": "Chris", "avatar": "https://randomuser.me/api/portraits/men/54.jpg", "text": "Accessibility is so important, thanks for sharing!", "date": "May 24"},
        {"post_id": 8, "author": "Anna", "avatar": "https://randomuser.me/api/portraits/women/55.jpg", "text": "Great tips for making web apps more inclusive.", "date": "May 24"}
    ]
    
    try:
        connection = mysql.connector.connect(**mysql_config)
        cursor = connection.cursor()
        
        # Clear existing comments
        cursor.execute("DELETE FROM comments")
        
        # Insert comments
        for comment in comments_data:
            cursor.execute('''
                INSERT INTO comments (post_id, author, avatar, text, date)
                VALUES (%s, %s, %s, %s, %s)
            ''', (
                comment["post_id"],
                comment["author"],
                comment["avatar"],
                comment["text"],
                comment["date"]
            ))
        
        connection.commit()
        print("Comments inserted successfully!")
        
    except Error as e:
        print(f"Error inserting comments: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def main():
    """Main function to set up the database"""
    print("Setting up MySQL database for blog posts...")
    
    # Create tables
    create_tables()
    
    # Insert data
    insert_authors()
    insert_posts()
    insert_comments()
    
    print("Database setup completed successfully!")

if __name__ == "__main__":
    main() 