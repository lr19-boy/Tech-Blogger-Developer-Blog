from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
import sqlite3
from flask_cors import CORS, cross_origin
import mysql.connector
import json
import requests
import os
from functools import wraps
from werkzeug.utils import secure_filename
from datetime import datetime
from mailer import send_email  # Import the send_email function from mailer.py
from twilio.rest import Client
import random

DB_PATH = 'auth.db'

def get_mysql_connection():
    """Get a fresh MySQL connection"""
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='auth_blog',
        autocommit=True
    )

def get_mysql_cursor():
    """Get a fresh MySQL cursor with connection check"""
    global mysql_conn
    try:
        if not mysql_conn.is_connected():
            mysql_conn = get_mysql_connection()
        return mysql_conn.cursor()
    except:
        mysql_conn = get_mysql_connection()
        return mysql_conn.cursor()

# Initialize MySQL connection
mysql_conn = get_mysql_connection()
mysql_cursor = mysql_conn.cursor()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True, allow_headers="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

ADMIN_AVATAR_FOLDER = 'uploads/admin'
USER_AVATAR_FOLDER = 'uploads/user'
os.makedirs(ADMIN_AVATAR_FOLDER, exist_ok=True)
os.makedirs(USER_AVATAR_FOLDER, exist_ok=True)
app.config['ADMIN_AVATAR_FOLDER'] = ADMIN_AVATAR_FOLDER
app.config['USER_AVATAR_FOLDER'] = USER_AVATAR_FOLDER

# Permission decorator for role-based access control
def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Get admin username from request headers or body
            admin_username = None
            if request.headers.get('x-admin-username'):
                admin_username = request.headers.get('x-admin-username')
            elif request.json and request.json.get('admin_username'):
                admin_username = request.json.get('admin_username')
            
            if not admin_username:
                return jsonify({'error': 'Admin username required for role verification'}), 401
            
            try:
                with sqlite3.connect(DB_PATH) as conn:
                    cursor = conn.cursor()
                    cursor.execute('SELECT role FROM admins WHERE username = ?', (admin_username,))
                    result = cursor.fetchone()
                    
                    if not result:
                        return jsonify({'error': 'Admin not found'}), 404
                    
                    admin_role = result[0] or 'admin'
                    
                    # Check role hierarchy
                    role_hierarchy = {
                        'superadmin': 3,
                        'admin': 2,
                        'readonly': 1
                    }
                    
                    required_level = role_hierarchy.get(required_role, 0)
                    admin_level = role_hierarchy.get(admin_role, 0)
                    
                    if admin_level < required_level:
                        return jsonify({'error': f'Insufficient permissions. Required: {required_role}, Current: {admin_role}'}), 403
                    
                    return f(*args, **kwargs)
                    
            except Exception as e:
                return jsonify({'error': f'Permission check failed: {str(e)}'}), 500
                
        return wrapper
    return decorator

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            avatar TEXT,
            role TEXT DEFAULT 'admin'
        )
    ''')      
    
    # Add avatar column if it does not exist
    cursor.execute("PRAGMA table_info(admins)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'avatar' not in columns:
        cursor.execute('ALTER TABLE admins ADD COLUMN avatar TEXT;')
    if 'role' not in columns:
        cursor.execute('ALTER TABLE admins ADD COLUMN role TEXT DEFAULT "admin";')
    
    # Add avatar and github_id columns to users table if they don't exist
    cursor.execute("PRAGMA table_info(users)")
    user_columns = [col[1] for col in cursor.fetchall()]
    if 'avatar' not in user_columns:
        cursor.execute('ALTER TABLE users ADD COLUMN avatar TEXT;')
    
    # Create contact_messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
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
    cursor.execute('SELECT id, username, email, role FROM admins WHERE (email = ? OR username = ?) AND password = ?', (identifier, identifier, password))
    admin = cursor.fetchone()
    if admin:
        return {
            'response': jsonify({
                'message': f'Admin logged in as {admin[2]}',
                'username': admin[1],
                'email': admin[2],
                'role': admin[3],
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
    result = handle_login(cursor, conn, username, email, password, is_user)
    return result['response'], result['status']

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
        print(f"❌ Error in authenticate: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins', methods=['POST'])
@require_role('admin')
def create_admin_api():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Check for duplicate username or email
            cursor.execute('SELECT id FROM admins WHERE username = ? OR email = ?', (username, email))
            if cursor.fetchone():
                return jsonify({'error': 'Username or email already exists'}), 400
            
            # Create new admin
            cursor.execute('INSERT INTO admins (username, email, password, role, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                          (username, email, password, 'admin'))
            conn.commit()
            
            return jsonify({
                'message': 'Admin created successfully',
                'username': username,
                'email': email
            }), 201
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins/<username>', methods=['PUT'])
def update_admin(username):
    data = request.get_json()
    new_username = data.get('username')
    new_email = data.get('email')
    new_password = data.get('password')
    
    conn = sqlite3.connect('auth.db')
    c = conn.cursor()
    c.execute('UPDATE admins SET username=?, email=?, password=? WHERE username=?',
              (new_username, new_email, new_password, username))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Admin updated successfully'}), 200

@app.route('/api/admins/<int:admin_id>', methods=['DELETE'])
@require_role('superadmin')
def delete_admin(admin_id):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Check if admin exists
            cursor.execute('SELECT username FROM admins WHERE id = ?', (admin_id,))
            admin = cursor.fetchone()
            if not admin:
                return jsonify({'error': 'Admin not found'}), 404
            
            # Delete admin
            cursor.execute('DELETE FROM admins WHERE id = ?', (admin_id,))
            conn.commit()
            
            return jsonify({
                'message': 'Admin deleted successfully',
                'deleted_admin': admin[0]
            }), 200
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users', methods=['POST'])
@require_role('admin')
def create_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Check for duplicate username or email
            cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
            if cursor.fetchone():
                return jsonify({'error': 'Username or email already exists'}), 400
            
            # Create new user
            cursor.execute('INSERT INTO users (username, email, password, is_user, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                          (username, email, password, True))
            conn.commit()
            
            return jsonify({
                'message': 'User created successfully',
                'username': username,
                'email': email
            }), 201
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@require_role('admin')
def update_user(user_id):
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username and not email and not password:
        return jsonify({'error': 'At least one field to update is required'}), 400
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'User not found'}), 404
            
            # Build update query
            update_fields = []
            params = []
            
            if username:
                update_fields.append('username = ?')
                params.append(username)
            if email:
                update_fields.append('email = ?')
                params.append(email)
            if password:
                update_fields.append('password = ?')
                params.append(password)
            
            params.append(user_id)
            cursor.execute(f'UPDATE users SET {", ".join(update_fields)} WHERE id = ?', params)
            conn.commit()
            
            return jsonify({'message': 'User updated successfully'}), 200
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@require_role('admin')
def delete_user(user_id):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Delete user
            cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
            conn.commit()
            
            return jsonify({
                'message': 'User deleted successfully',
                'deleted_user': user[0]
            }), 200
            
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# New API endpoints for blog posts
@app.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        cursor = get_mysql_cursor()
        cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.readTime, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            ORDER BY p.id DESC
        ''')
        posts = cursor.fetchall()
        
        #print("Fetched posts:", posts)
        
        posts_list = []
        for post in posts:
            # Parse tags from JSON string back to list
            tags_str = post[3]  # tags column
            try:
                tags = json.loads(tags_str) if tags_str else []
            except Exception as e:
                print("Error decoding tags JSON:", tags_str, e)
                tags = []
            
            posts_list.append({
                'id': post[0],
                'date': post[1],
                'title': post[2],
                'tags': tags,
                'summary': post[4],
                'reactions': post[5],
                'comments': post[6],
                'readTime': post[7],
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
        cursor = get_mysql_cursor()
        cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.readTime, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE p.id = %s
        ''', (post_id,))
        post = cursor.fetchone()
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Parse tags from JSON string back to list
        tags_str = post[3]  # tags column
        try:
            tags = json.loads(tags_str) if tags_str else []
        except Exception as e:
            print("Error decoding tags JSON:", tags_str, e)
            tags = []
        
        # Get comments for this post
        cursor.execute('''
            SELECT id, author, avatar, text, date
            FROM comments
            WHERE post_id = %s
            ORDER BY created_at ASC
        ''', (post_id,))
        comments = cursor.fetchall()
        
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
            'readTime': post[7],
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
        cursor = get_mysql_cursor()
        cursor.execute('SELECT id, name, avatar FROM authors ORDER BY name')
        authors = cursor.fetchall()
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
        cursor = get_mysql_cursor()
        cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.readTime, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE a.id = %s
            ORDER BY p.id DESC
        ''', (author_id,))
        posts = cursor.fetchall()
        
        # print("Fetched posts:", posts)
        
        posts_list = []
        for post in posts:
            # Parse tags from JSON string back to list
            tags_str = post[3]  # tags column
            try:
                tags = json.loads(tags_str) if tags_str else []
            except Exception as e:
                print("Error decoding tags JSON:", tags_str, e)
                tags = []
            
            posts_list.append({
                'id': post[0],
                'date': post[1],
                'title': post[2],
                'tags': tags,
                'summary': post[4],
                'reactions': post[5],
                'comments': post[6],
                'readTime': post[7],
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
            cursor.execute('SELECT id, username, email, role FROM admins WHERE username = ? OR email = ?', (stored_value, stored_value))
            admin = cursor.fetchone()
            if admin:
                return jsonify({
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2],
                    'role': admin[3],
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
        cursor = get_mysql_cursor()
        cursor.execute('UPDATE posts SET reactions = reactions + 1 WHERE id = %s', (post_id,))
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
        cursor = get_mysql_cursor()
        cursor.execute(
            'INSERT INTO comments (post_id, author, avatar, text, date) VALUES (%s, %s, %s, %s, %s)',
            (post_id, author, avatar, text, date)
        )
        cursor.execute('UPDATE posts SET comments = comments + 1 WHERE id = %s', (post_id,))
        mysql_conn.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/user/<username>', methods=['GET'])
def get_posts_by_username(username):
    try:
        cursor = get_mysql_cursor()
        cursor.execute('SELECT id FROM authors WHERE name = %s', (username,))
        author = cursor.fetchone()
        if not author:
            # Check if user exists in SQLite users table
            with sqlite3.connect(DB_PATH) as conn:
                sqlite_cursor = conn.cursor()
                sqlite_cursor.execute('SELECT username, email FROM users WHERE username = ?', (username,))
                sqlite_user = sqlite_cursor.fetchone()
                if sqlite_user:
                    cursor.execute('INSERT INTO authors (name, avatar) VALUES (%s, %s)', 
                                   (username, 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'))
                    mysql_conn.commit()
                    author_id = cursor.lastrowid
                else:
                    return jsonify({'error': 'User not found'}), 404
        else:
            author_id = author[0]
        
        cursor.execute('''
            SELECT p.id, p.date, p.title, p.tags, p.summary, p.reactions, p.comments, p.readTime, p.cover,
                   a.id as author_id, a.name as author_name, a.avatar as author_avatar
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE a.id = %s
            ORDER BY p.id DESC
        ''', (author_id,))
        posts = cursor.fetchall()
        
        # print("Fetched posts:", posts)
        
        posts_list = []
        for post in posts:
            # Parse tags from JSON string back to list
            tags_str = post[3]  # tags column
            try:
                tags = json.loads(tags_str) if tags_str else []
            except Exception as e:
                print("Error decoding tags JSON:", tags_str, e)
                tags = []
            
            posts_list.append({
                'id': post[0],
                'date': post[1],
                'title': post[2],
                'tags': tags,
                'summary': post[4],
                'reactions': post[5],
                'comments': post[6],
                'readTime': post[7],
                'cover': post[8],
                'author': {
                    'id': post[9],
                    'name': post[10],
                    'avatar': post[11]
                }
            })
        
        return jsonify(posts_list), 200
    except Exception as e:
        print("Error in get_posts_by_username:", e)
        import traceback; traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admin/avatar', methods=['POST'])
def upload_admin_avatar():
    username = request.form['username']
    file = request.files['avatar']
    if file and username:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['ADMIN_AVATAR_FOLDER'], filename)
        file.save(filepath)
        # Store the relative path in the DB
        avatar_path = f'/uploads/admin/{filename}'
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE admins SET avatar = ? WHERE username = ?', (avatar_path, username))
        conn.commit()
        conn.close()
        return jsonify({'avatar': avatar_path}), 200
    return jsonify({'error': 'No file uploaded'}), 400

@app.route('/api/user/avatar', methods=['POST'])
def upload_user_avatar():
    username = request.form['username']
    file = request.files['avatar']
    if file and username:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['USER_AVATAR_FOLDER'], filename)
        file.save(filepath)
        # Store the relative path in the DB
        avatar_path = f'/uploads/user/{filename}'
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE users SET avatar = ? WHERE username = ?', (avatar_path, username))
        conn.commit()
        conn.close()
        return jsonify({'avatar': avatar_path}), 200
    return jsonify({'error': 'No file uploaded'}), 400

@app.route('/uploads/admin/<filename>')
def uploaded_admin_avatar(filename):
    return send_from_directory(app.config['ADMIN_AVATAR_FOLDER'], filename)

@app.route('/uploads/user/<filename>')
def uploaded_user_avatar(filename):
    return send_from_directory(app.config['USER_AVATAR_FOLDER'], filename)

@app.route('/api/admins/<username>/debug', methods=['GET'])
def debug_admin(username):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, avatar FROM admins WHERE username = ?', (username,))
            result = cursor.fetchone()
            if result:
                return jsonify({
                    'id': result[0],
                    'username': result[1],
                    'email': result[2],
                    'avatar': result[3]
                }), 200
            else:
                return jsonify({'error': 'Admin not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/admins', methods=['GET'])
def get_admins():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, created_at, role FROM admins')
            admins = cursor.fetchall()
            admin_list = [
                {
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2],
                    'created_at': admin[3],
                    'role': admin[4] or 'admin'
                }
                for admin in admins
            ]
        return jsonify(admin_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, is_user, created_at FROM users')
            users = cursor.fetchall()
            user_list = [
                {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': bool(user[3]),
                    'created_at': user[4]
                }
                for user in users
            ]
        return jsonify(user_list), 200
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
                'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
                (username, email, password, 'superadmin')
            )
            conn.commit()
        else:
            print("Admin already exists. Skipping seeding.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

@app.route('/api/users/<int:user_id>/password', methods=['GET'])
def get_user_password(user_id):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT password FROM users WHERE id = ?', (user_id,))
            result = cursor.fetchone()
            if result:
                return jsonify({'password': result[0]}), 200
            else:
                return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/')
def index():
    return 'Flask backend is running!'

@app.route('/api/admins/<username>/avatar', methods=['GET'])
def get_admin_avatar(username):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT avatar FROM admins WHERE username = ?', (username,))
    row = c.fetchone()
    conn.close()
    if row and row[0]:
        avatar_path = row[0].replace('\\', '/').replace('src/', '').replace('//', '/')
        if not avatar_path.startswith('/'):
            avatar_path = '/' + avatar_path
        return jsonify({'avatar': avatar_path})
    return jsonify({'avatar': None}), 200

@app.route('/api/users/<username>/avatar', methods=['GET'])
def get_user_avatar(username):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT avatar FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    conn.close()
    if row and row[0]:
        avatar_path = row[0].replace('\\', '/').replace('src/', '').replace('//', '/')
        if not avatar_path.startswith('/'):
            avatar_path = '/' + avatar_path
        return jsonify({'avatar': avatar_path})
    return jsonify({'avatar': None}), 200

@app.route('/api/posts', methods=['POST'])
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def create_post():
    data = request.json
    # Extract fields from data
    author_name = data['author']['name']
    author_avatar = data['author']['avatar']
    date = data['date']
    title = data['title']
    tags = data['tags']
    summary = data['summary']
    reactions = data.get('reactions', 0)
    comments = data.get('comments', 0)
    read_time = data.get('readTime', '')
    cover = data.get('cover', '')
    # Find author_id from authors table (or create if not exists)
    cursor = get_mysql_cursor()
    cursor.execute('SELECT id FROM authors WHERE name = %s', (author_name,))
    author = cursor.fetchone()
    if not author:
        cursor.execute('INSERT INTO authors (name, avatar) VALUES (%s, %s)', (author_name, author_avatar))
        mysql_conn.commit()
        author_id = cursor.lastrowid
    else:
        author_id = author[0]
    # Insert post
    cursor.execute(
        'INSERT INTO posts (author_id, date, title, tags, summary, reactions, comments, readTime, cover) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)',
        (author_id, date, title, json.dumps(tags), summary, reactions, comments, read_time, cover)
    )
    mysql_conn.commit()
    return jsonify({'success': True}), 201

# --- Remove followers/following API and helpers ---
# (No code for followers/following remains)

@app.route('/api/upload/cover', methods=['POST'])
def upload_cover():
    if 'cover' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['cover']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file:
        upload_folder = 'uploads/covers'
        os.makedirs(upload_folder, exist_ok=True)
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(upload_folder, unique_filename)
        file.save(filepath)
        cover_url = f'/uploads/covers/{unique_filename}'
        return jsonify({'url': cover_url, 'filename': unique_filename}), 200
    else:
        return jsonify({'error': 'Invalid file'}), 400

@app.route('/uploads/covers/<filename>')
def uploaded_cover(filename):
    """Serve uploaded cover images"""
    return send_from_directory('uploads/covers', filename)

@app.route('/api/notifications/<username>', methods=['GET'])
def get_user_notifications(username):
    try:
        cursor = get_mysql_cursor()
        # Get the user_id from the authors table
        cursor.execute('SELECT id FROM authors WHERE name = %s', (username,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user_id = user[0]
        # Get notifications for this user
        cursor.execute('''
            SELECT n.id, n.message, n.is_read, n.created_at
            FROM notifications n
            WHERE n.user_id = %s
            ORDER BY n.created_at DESC
        ''', (user_id,))
        notifications = cursor.fetchall()
        notifications_list = [
            {
                'id': notif[0],
                'message': notif[1],
                'is_read': bool(notif[2]),
                'created_at': notif[3]
            }
            for notif in notifications
        ]
        return jsonify(notifications_list), 200
    except Exception as e:
        print("Error in get_user_notifications:", e)
        import traceback; traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        cursor = get_mysql_cursor()
        
        cursor.execute('UPDATE notifications SET is_read = TRUE WHERE id = %s', (notification_id,))
        mysql_conn.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/notifications/<username>/unread-count', methods=['GET'])
def get_unread_notifications_count(username):
    """Get count of unread notifications for a user"""
    try:
        cursor = get_mysql_cursor()
        
        # Get the user_id from the authors table
        cursor.execute('SELECT id FROM authors WHERE name = %s', (username,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_id = user[0]
        
        # Count unread notifications
        cursor.execute('SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = FALSE', (user_id,))
        count = cursor.fetchone()[0]
        
        return jsonify({'unread_count': count}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/debug/followers', methods=['GET'])
def debug_followers():
    """Debug endpoint to check followers table status"""
    try:
        # Get fresh MySQL cursor
        cursor = get_mysql_cursor()
        
        # Check if followers table exists
        cursor.execute("SHOW TABLES LIKE 'followers'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            # Create the followers table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS followers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    author_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES authors(id),
                    FOREIGN KEY (author_id) REFERENCES authors(id)
                )
            ''')
            return jsonify({'message': 'Followers table created successfully'}), 200
        
        # Check table structure
        cursor.execute("DESCRIBE followers")
        columns = cursor.fetchall()
        
        # Check if table has data
        cursor.execute("SELECT COUNT(*) FROM followers")
        count = cursor.fetchone()[0]
        
        # Check authors table
        cursor.execute("SELECT COUNT(*) FROM authors")
        authors_count = cursor.fetchone()[0]
        
        return jsonify({
            'followers_table_exists': True,
            'followers_table_columns': [col[0] for col in columns],
            'followers_count': count,
            'authors_count': authors_count,
            'mysql_connected': mysql_conn.is_connected()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Debug error: {str(e)}'}), 500

@app.route('/api/analytics/<username>', methods=['GET'])
def get_analytics(username):
    try:
        cursor = get_mysql_cursor()
        # Get author id
        cursor.execute('SELECT id FROM authors WHERE name = %s', (username,))
        author = cursor.fetchone()
        if not author:
            return jsonify({'error': 'User not found'}), 404
        author_id = author[0]

        # Views this month
        now = datetime.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        cursor.execute('''
            SELECT SUM(views) FROM posts
            WHERE author_id = %s AND date >= %s
        ''', (author_id, month_start))
        views_this_month = cursor.fetchone()[0] or 0

        # Top post this month
        cursor.execute('''
            SELECT title, views, date FROM posts
            WHERE author_id = %s AND date >= %s
            ORDER BY views DESC LIMIT 1
        ''', (author_id, month_start))
        top_post = cursor.fetchone()
        if top_post:
            top_post_title, top_post_views, top_post_date = top_post
            # If top_post_date is already a string, just use it directly
            top_post_views_str = f"{top_post_views} views • {top_post_date[:10]}"
        else:
            top_post_title, top_post_views_str = None, None

        # Average views per post
        cursor.execute('SELECT AVG(views) FROM posts WHERE author_id = %s', (author_id,))
        avg_views = cursor.fetchone()[0] or 0

        # Followers growth (dummy: always +10%)
        followers_growth = "+10%"

        return jsonify({
            "views_this_month": views_this_month,
            "top_post_title": top_post_title,
            "top_post_views": top_post_views_str,
            "average_views_per_post": int(avg_views),
            "followers_growth": followers_growth
        })
    except Exception as e:
        print("Error in get_analytics:", e)
        import traceback; traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/notifications/<username>', methods=['POST'])
def create_test_notification(username):
    """Create a test notification for the given username."""
    try:
        cursor = get_mysql_cursor()
        # Get the user_id from the authors table
        cursor.execute('SELECT id FROM authors WHERE name = %s', (username,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user_id = user[0]
        # Insert a test notification
        cursor.execute('''
            INSERT INTO notifications (user_id, from_user_id, type, message)
            VALUES (%s, %s, %s, %s)
        ''', (user_id, user_id, 'test', f'This is a test notification for {username}'))
        mysql_conn.commit()
        return jsonify({'message': f'Test notification created for {username}'}), 201
    except Exception as e:
        print('Error creating test notification:', e)
        import traceback; traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

SENDER_EMAIL = "lazarusrolando399@gmail.com"  # Replace with your sender email
APP_PASSWORD = "qqnc rblw vlup dypt"  # Replace with your app password
RECEIVER_EMAIL = "lazarusrolando618@gmail.com"  # Replace with your receiver email

@app.route('/api/send-email', methods=['POST'])
def api_send_email():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject') or f"New message from {name}"
    message = data.get('message')
    receiver_email = data.get('receiver_email')  # Add this to your form and fetch

    body = f"Name: {name}\nEmail: {email}\nMessage:\n{message}"

    # Store the message in the contact_messages table
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
                (name, email, subject, message)
            )
            conn.commit()
    except Exception as e:
        print(f"❌ Failed to save contact message: {e}")
        return jsonify({"status": "error", "error": "Failed to save message"}), 500

    # Send email to both the user and the admin
    user_success = send_email(SENDER_EMAIL, email, APP_PASSWORD, subject, body)
    admin_success = send_email(SENDER_EMAIL, receiver_email, APP_PASSWORD, subject, body)
    if user_success and admin_success:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error"}), 500

@app.route('/api/user/settings', methods=['PUT'])
def update_own_settings():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    bio = data.get('bio', '')

    if not username:
        return jsonify({'error': 'Username required'}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            update_fields = []
            params = []
            if email:
                update_fields.append('email = ?')
                params.append(email)
            if password:
                update_fields.append('password = ?')
                params.append(password)
            if bio:
                # Add bio column if not exists
                cursor.execute("PRAGMA table_info(users)")
                user_columns = [col[1] for col in cursor.fetchall()]
                if 'bio' not in user_columns:
                    cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT;')
                update_fields.append('bio = ?')
                params.append(bio)
            if not update_fields:
                return jsonify({'error': 'No fields to update'}), 400
            params.append(username)
            cursor.execute(f'UPDATE users SET {", ".join(update_fields)} WHERE username = ?', params)
            conn.commit()

        # Insert notification in MySQL
        cursor = get_mysql_cursor()
        cursor.execute('SELECT id FROM authors WHERE name = %s', (username,))
        author = cursor.fetchone()
        if author:
            user_id = author[0]
            cursor.execute('''
                INSERT INTO notifications (user_id, type, message)
                VALUES (%s, %s, %s)
            ''', (user_id, 'settings', 'Your account settings were updated.'))
            mysql_conn.commit()

        return jsonify({'message': 'Settings updated and notification sent'}), 200
    except Exception as e:
        print("Error updating user settings:", e)
        import traceback; traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
