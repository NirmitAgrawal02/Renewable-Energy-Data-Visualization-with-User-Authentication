import sqlite3

# Function to get all table names in the database
def get_all_tables():
    conn = sqlite3.connect('../users.db')  # Adjust path as needed
    cursor = conn.cursor()
    
    # Query to get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    
    # Fetch all table names
    tables = cursor.fetchall()
    
    # Close the connection
    conn.close()
    
    # Return table names as a list
    return [table[0] for table in tables]

if __name__ == "__main__":
    tables = get_all_tables()
    print("Tables in the database:")
    for table in tables:
        print(table)
