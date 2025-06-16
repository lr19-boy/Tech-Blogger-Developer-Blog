from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

DB_PATH = 'auth.db'

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_user BOOLEAN NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def handle_login(cursor, email, password):
    cursor.execute('SELECT id, username, email, is_user FROM users WHERE email = ? AND password = ?', (email, password))
    user = cursor.fetchone()
    if user:
        role = 'User' if user[3] else 'Admin'
        return {
            'response': jsonify({
                'message': f'{role} logged in as {email}',
                'username': user[1],
                'email': user[2],
                'is_user': bool(user[3]),
                'redirect': '/user' if user[3] else '/admin'
            }),
            'status': 200
        }
    else:
        return {
            'response': jsonify({'error': 'Invalid email or password'}),
            'status': 401
        }

def handle_registration(cursor, conn, username, email, password, is_user):
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        return {
            'response': jsonify({'error': 'Email already registered'}),
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

def handle_admin_login(cursor, email, password):
    cursor.execute('SELECT id, username, email FROM admins WHERE email = ? AND password = ?', (email, password))
    admin = cursor.fetchone()
    if admin:
        return {
            'response': jsonify({
                'message': f'Admin logged in as {email}',
                'username': admin[1],
                'email': admin[2],
                'is_user': False,
                'redirect': '/admin'
            }),
            'status': 200
        }
    else:
        return {
            'response': jsonify({'error': 'Invalid email or password'}),
            'status': 401
        }

def handle_admin_registration(cursor, conn, username, email, password):
    cursor.execute('SELECT id FROM admins WHERE email = ?', (email,))
    if cursor.fetchone():
        return {
            'response': jsonify({'error': 'Email already registered'}),
            'status': 400
        }
    cursor.execute('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)',
                   (username, email, password))
    conn.commit()
    return {
        'response': jsonify({
            'message': 'Admin registration successful',
            'username': username,
            'email': email,
            'is_user': False,
            'redirect': '/admin'
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
            if is_user:
                if is_login:
                    result = handle_login(cursor, email, password)
                else:
                    result = handle_registration(cursor, conn, username, email, password, is_user)
            else:
                if is_login:
                    result = handle_admin_login(cursor, email, password)
                else:
                    result = handle_admin_registration(cursor, conn, username, email, password)
            return result['response'], result['status']
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/auth/user', methods=['POST'])
def get_logged_in_user():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Username required'}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, is_user FROM users WHERE username = ?', (username,))
            user = cursor.fetchone()
            if user:
                return jsonify({
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'is_user': bool(user[3])
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

@app.route('/api/admins', methods=['GET'])
def get_admins():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email FROM admins')
            admins = cursor.fetchall()
            admin_list = [
                {
                    'id': admin[0],
                    'username': admin[1],
                    'email': admin[2]
                }
                for admin in admins
            ]
        return jsonify(admin_list), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
    app.run(debug=True)
