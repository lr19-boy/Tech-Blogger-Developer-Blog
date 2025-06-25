import sqlite3

# Connect to the auth.db database
conn = sqlite3.connect('auth.db')
cursor = conn.cursor()

# Try to add the created_at column
try:
    cursor.execute("ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))")
    print("'created_at' column added to users table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("'created_at' column already exists.")
    else:
        raise

# Backfill existing rows where created_at is NULL
cursor.execute("UPDATE users SET created_at = datetime('now') WHERE created_at IS NULL")

conn.commit()
conn.close()
print("Done.") 