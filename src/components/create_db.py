import mysql.connector
from mysql.connector import errorcode

DB_NAME = 'auth_blog'

config = {
    'user': 'root',
    'password': '',  # Update with your MySQL root password
    'host': '127.0.0.1',
}

def create_database(cursor):
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET 'utf8'")
    except mysql.connector.Error as err:
        print(f"Failed creating database: {err}")
        exit(1)

def main():
    cnx = mysql.connector.connect(**config)
    cursor = cnx.cursor()
    create_database(cursor)
    print(f"Database '{DB_NAME}' checked/created.")
    cursor.close()
    cnx.close()

if __name__ == '__main__':
    main() 