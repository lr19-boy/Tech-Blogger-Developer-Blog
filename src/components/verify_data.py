import mysql.connector

DB_NAME = 'auth'

config = {
    'user': 'root',
    'password': '',  # Update with your MySQL root password
    'host': '127.0.0.1',
    'database': DB_NAME
}

def verify_table(cursor, table):
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"Table '{table}' has {count} records.")

def main():
    cnx = mysql.connector.connect(**config)
    cursor = cnx.cursor()
    for table in ['authors', 'posts', 'comments']:
        verify_table(cursor, table)
    cursor.close()
    cnx.close()

if __name__ == '__main__':
    main() 