from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS, cross_origin
import mysql.connector
import json
import requests

DB_PATH = 'auth.db'

mysql_conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='auth'
)

mysql_cursor = mysql_conn.cursor()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True, allow_headers="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Example: In-memory user API keys (replace with your DB logic)
user_api_keys = {}

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_user BOOLEAN NOT NULL
        )
    ''')

    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')    

    conn.commit()
    conn.close()

def handle_login(cursor, identifier, password):
    # Try to login by email or username in users table
    cursor.execute('SELECT id, username, email, is_user FROM users WHERE (email = ? OR username = ?) AND password = ?', (identifier, identifier, password))
    user = cursor.fetchone()
    if user:
        role = 'User' if user[3] else 'Admin'
        return {
            'response': jsonify({
                'message': f'{role} logged in as {user[2]}',
                'username': user[1],
                'email': user[2],
                'is_user': bool(user[3]),
                'redirect': '/user' if user[3] else '/admin'
            }),
            'status': 200
        }
    # Try to login by email or username in admins table
    cursor.execute('SELECT id, username, email FROM admins WHERE (email = ? OR username = ?) AND password = ?', (identifier, identifier, password))
    admin = cursor.fetchone()
    if admin:
        return {
            'response': jsonify({
                'message': f'Admin logged in as {admin[2]}',
                'username': admin[1],
                'email': admin[2],
                'is_user': False,
                'redirect': '/admin'
            }),
            'status': 200
        }
    return {
        'response': jsonify({'error': 'Invalid username/email or password'}),
        'status': 401
    }

def handle_registration(cursor, conn, username, email, password, is_user):
    # Check for duplicate username or email in users table
    cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
    if cursor.fetchone():
        return {
            'response': jsonify({'error': 'Username or email already registered as user'}),
            'status': 400
        }
    # Check for duplicate username or email in admins table
    cursor.execute('SELECT id FROM admins WHERE username = ? OR email = ?', (username, email))
    if cursor.fetchone():
        return {
            'response': jsonify({'error': 'Username or email already registered as admin'}),
            'status': 400
        }
    cursor.execute('INSERT INTO users (username, email, password, is_user) VALUES (?, ?, ?, ?)',
                   (username, email, password, is_user))
    conn.commit()
    return {
        'response': jsonify({
            'message': 'Registration successful',
            'username': username,
            'email': email,
            'is_user': is_user,
            'redirect': '/user' if is_user else '/admin'
        }),
        'status': 201
    }

@app.route('/auth', methods=['POST'])
def authenticate():
    data = request.json
    is_login = data.get('isLogin')
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    is_user = data.get('is_user', True)  # Default to user if not provided

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            if is_login:
                # Use username if provided, else email
                identifier = username if username else email
                result = handle_login(cursor, identifier, password)
            else:
                result = handle_registration(cursor, conn, username, email, password, is_user)
            return result['response'], result['status']
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins', methods=['POST'])
def get_logged_in_admin():
    data = request.json
    stored_value = data.get('username')  # This could be username or email

    if not stored_value:
        return jsonify({'error': 'Username or email required'}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            # Try to find user by username or email in users table
            cursor.execute('SELECT id, username, email, is_user FROM users WHERE username = ? OR email = ?', (stored_value, stored_value))
            user = cursor.fetchone()
            if user:
                return jsonify({
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': bool(user[3]),
                    'is_admin': not bool(user[3])
                }), 200
            # If not found in users, check admins table
            cursor.execute('SELECT id, username, email FROM admins WHERE username = ? OR email = ?', (stored_value, stored_value))
            admin = cursor.fetchone()
            if admin:
                return jsonify({
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2],
                    'is_user': False,
                    'is_admin': True
                }), 200
            else:
                return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, is_user FROM users')
            users = cursor.fetchall()
            user_list = [
                {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': bool(user[3])
                }
                for user in users
            ]
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/logout', methods=['POST'])
def logout():
    # For now, just return success since we're handling logout client-side
    # In a real application, you might want to invalidate server-side sessions
    return jsonify({'message': 'Logged out successfully'}), 200

def create_admin(username, email, password):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # Check if the admins table is empty
        cursor.execute('SELECT COUNT(*) FROM admins')
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                'INSERT INTO admins (username, email, password) VALUES (?, ?, ?)',
                (username, email, password)
            )
            conn.commit()
            print("Admin user created successfully.")
        else:
            print("Admin already exists. Skipping seeding.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

@app.route('/api/admins', methods=['GET'])
def get_admins():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, created_at FROM admins')
            admins = cursor.fetchall()
            admin_list = [
                {
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2],
                    'created_at': admin[3]
                }
                for admin in admins
            ]
        return jsonify(admin_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins', methods=['POST'])
def create_admin_api():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)', (username, email, password))
            conn.commit()
            return jsonify({'message': 'Admin created successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins/<int:admin_id>', methods=['PUT'])
def update_admin(admin_id):
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE admins SET username = ?, email = ?, password = ? WHERE id = ?', (username, email, password, admin_id))
            if cursor.rowcount == 0:
                return jsonify({'error': 'Admin not found'}), 404
            conn.commit()
            return jsonify({'message': 'Admin updated successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins/<int:admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM admins WHERE id = ?', (admin_id,))
            if cursor.rowcount == 0:
                return jsonify({'error': 'Admin not found'}), 404
            conn.commit()
            return jsonify({'message': 'Admin deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/auth/user', methods=['POST', 'OPTIONS'])
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def get_logged_in_user():
    data = request.json
    stored_value = data.get('username')  # This could be username or email

    if not stored_value:
        return jsonify({'error': 'Username or email required'}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            # Try to find user by username or email in users table
            cursor.execute('SELECT id, username, email, is_user FROM users WHERE username = ? OR email = ?', (stored_value, stored_value))
            user = cursor.fetchone()
            if user:
                return jsonify({
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': bool(user[3]),
                    'is_admin': not bool(user[3])
                }), 200
            # If not found in users, check admins table
            cursor.execute('SELECT id, username, email FROM admins WHERE username = ? OR email = ?', (stored_value, stored_value))
            admin = cursor.fetchone()
            if admin:
                return jsonify({
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2],
                    'is_user': False,
                    'is_admin': True
                }), 200
            else:
                return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?', (username, email, password, user_id))
            if cursor.rowcount == 0:
                return jsonify({'error': 'User not found'}), 404
            conn.commit()
            return jsonify({'message': 'User updated successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
            if cursor.fetchone():
                return jsonify({'error': 'Username or email already exists'}), 409
            cursor.execute('INSERT INTO users (username, email, password, is_user) VALUES (?, ?, ?, ?)', (username, email, password, True))
            conn.commit()
            return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
            if cursor.rowcount == 0:
                return jsonify({'error': 'User not found'}), 404
            conn.commit()
            return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# New API endpoints for blog posts
@app.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        mysql_cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.read_time, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            ORDER BY p.id DESC
        ''')
        posts = mysql_cursor.fetchall()
        
        posts_list = []
        for post in posts:
            # Parse tags from JSON string back to list
            tags_str = post[3]  # tags column
            try:
                tags = json.loads(tags_str) if tags_str else []
            except:
                tags = []
            
            posts_list.append({
                'id': post[0],
                'date': post[1],
                'title': post[2],
                'tags': tags,
                'summary': post[4],
                'reactions': post[5],
                'comments': post[6],
                'read_time': post[7],
                'cover': post[8],
                'author': {
                    'id': post[9],
                    'name': post[10],
                    'avatar': post[11]
                }
            })
        
        return jsonify(posts_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        # Get post details
        mysql_cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.read_time, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE p.id = %s
        ''', (post_id,))
        post = mysql_cursor.fetchone()
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Parse tags from JSON string back to list
        tags_str = post[3]  # tags column
        try:
            tags = json.loads(tags_str) if tags_str else []
        except:
            tags = []
        
        # Get comments for this post
        mysql_cursor.execute('''
            SELECT id, author, avatar, text, date
            FROM comments
            WHERE post_id = %s
            ORDER BY created_at ASC
        ''', (post_id,))
        comments = mysql_cursor.fetchall()
        
        comments_list = [
            {
                'id': comment[0],
                'author': comment[1],
                'avatar': comment[2],
                'text': comment[3],
                'date': comment[4]
            }
            for comment in comments
        ]
        
        post_data = {
            'id': post[0],
            'date': post[1],
            'title': post[2],
            'tags': tags,
            'summary': post[4],
            'reactions': post[5],
            'comments': post[6],
            'read_time': post[7],
            'cover': post[8],
            'author': {
                'id': post[9],
                'name': post[10],
                'avatar': post[11]
            },
            'commentsList': comments_list
        }
        
        return jsonify(post_data), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/authors', methods=['GET'])
def get_authors():
    try:
        mysql_cursor.execute('SELECT id, name, avatar FROM authors ORDER BY name')
        authors = mysql_cursor.fetchall()
        
        authors_list = [
            {
                'id': author[0],
                'name': author[1],
                'avatar': author[2]
            }
            for author in authors
        ]
        
        return jsonify(authors_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/posts/author/<int:author_id>', methods=['GET'])
def get_posts_by_author(author_id):
    try:
        mysql_cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.read_time, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE a.id = %s
            ORDER BY p.id DESC
        ''', (author_id,))
        posts = mysql_cursor.fetchall()
        
        posts_list = []
        for post in posts:
            # Parse tags from JSON string back to list
            tags_str = post[3]  # tags column
            try:
                tags = json.loads(tags_str) if tags_str else []
            except:
                tags = []
            
            posts_list.append({
                'id': post[0],
                'date': post[1],
                'title': post[2],
                'tags': tags,
                'summary': post[4],
                'reactions': post[5],
                'comments': post[6],
                'read_time': post[7],
                'cover': post[8],
                'author': {
                    'id': post[9],
                    'name': post[10],
                    'avatar': post[11]
                }
            })
        
        return jsonify(posts_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/auth/admin', methods=['POST', 'OPTIONS'])
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def get_logged_in_admin_auth():
    data = request.json
    stored_value = data.get('username')  # This could be username or email

    if not stored_value:
        return jsonify({'error': 'Username or email required'}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # First check if user exists in admins table
            cursor.execute('SELECT id, username, email FROM admins WHERE username = ? OR email = ?', (stored_value, stored_value))
            admin = cursor.fetchone()
            if admin:
                return jsonify({
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2],
                    'is_user': False,
                    'is_admin': True
                }), 200
            
            # If not found in admins table, check users table for admin users (is_user = false)
            cursor.execute('SELECT id, username, email, is_user FROM users WHERE (username = ? OR email = ?) AND is_user = 0', (stored_value, stored_value))
            user = cursor.fetchone()
            if user:
                return jsonify({
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': False,
                    'is_admin': True
                }), 200
            
            # If not found in either table, return error
            return jsonify({'error': 'Admin not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/auth/user-only', methods=['POST', 'OPTIONS'])
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def get_logged_in_user_only():
    data = request.json
    stored_value = data.get('username')  # This could be username or email

    if not stored_value:
        return jsonify({'error': 'Username or email required'}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Check if user exists in users table with is_user = true
            cursor.execute('SELECT id, username, email, is_user FROM users WHERE (username = ? OR email = ?) AND is_user = 1', (stored_value, stored_value))
            user = cursor.fetchone()
            if user:
                return jsonify({
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': True,
                    'is_admin': False
                }), 200
            
            # If not found, return error
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/posts/<int:post_id>/react', methods=['POST'])
def add_reaction(post_id):
    try:
        mysql_cursor.execute('UPDATE posts SET reactions = reactions + 1 WHERE id = %s', (post_id,))
        mysql_conn.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<int:post_id>/comment', methods=['POST'])
def add_comment(post_id):
    data = request.json
    author = data.get('author', 'Guest')
    avatar = data.get('avatar', '')
    text = data.get('text', '')
    date = data.get('date', '')
    try:
        mysql_cursor.execute(
            'INSERT INTO comments (post_id, author, avatar, text, date) VALUES (%s, %s, %s, %s, %s)',
            (post_id, author, avatar, text, date)
        )
        mysql_cursor.execute('UPDATE posts SET comments = comments + 1 WHERE id = %s', (post_id,))
        mysql_conn.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/user/<username>', methods=['GET'])
def get_posts_by_username(username):
    limit = request.args.get('limit', default=4, type=int)
    try:
        mysql_cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.read_time, p.cover,
                   a.id as id, a.name as name, a.avatar as avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE a.name = %s
            ORDER BY p.id DESC
            LIMIT %s
        ''', (username, limit))
        posts = mysql_cursor.fetchall()
        posts_list = []
        for post in posts:
            tags_str = post[3]
            try:
                tags = json.loads(tags_str) if tags_str else []
            except:
                tags = []
            posts_list.append({
                'id': post[0],
                'date': post[1],
                'title': post[2],
                'tags': tags,
                'summary': post[4],
                'reactions': post[5],
                'comments': post[6],
                'read_time': post[7],
                'cover': post[8],
                'author': {
                    'id': post[9],
                    'name': post[10],
                    'avatar': post[11]
                }
            })
        return jsonify(posts_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins/<int:admin_id>/apikey', methods=['POST'])
def update_admin_apikey(admin_id):
    data = request.json
    api_key = data.get('apiKey')
    if not api_key:
        return jsonify({'error': 'API key is required'}), 400
    try:
        mysql_cursor.execute('UPDATE admins SET api_key = %s WHERE id = %s', (api_key, admin_id))
        mysql_conn.commit()
        return jsonify({'message': 'API key updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/protected', methods=['GET'])
def protected_route():
    api_key = request.headers.get('x-api-key')
    if not api_key:
        return jsonify({'error': 'API key is required'}), 401
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email FROM admins WHERE api_key = ?', (api_key,))
            admin = cursor.fetchone()
            if admin:
                return jsonify({
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2]
                }), 200
            else:
                return jsonify({'error': 'Admin not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users/<username>/apikey', methods=['GET', 'POST'])
def user_api_key(username):
    if request.method == 'GET':
        # Return the user's API key
        api_key = user_api_keys.get(username, 'sk-xxxx-xxxx-xxxx')
        return jsonify({'api_key': api_key})
    elif request.method == 'POST':
        data = request.get_json()
        api_key = data.get('apiKey')
        if not api_key:
            return jsonify({'error': 'No API key provided'}), 400
        user_api_keys[username] = api_key
        return jsonify({'message': 'API key updated', 'api_key': api_key})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
