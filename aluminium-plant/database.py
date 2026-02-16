import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,
    category TEXT,
    quantity REAL,
    cost_per_unit REAL
    min_level REAL DEFAULT 0
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_name TEXT,
    material_cost REAL
    batch_date TEXT,
    shift TEXT,
    status TEXT,
    created_at TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS batch_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER,
    item_id INTEGER,
    quantity_used REAL,
    cost REAL
)
""")

conn.execute("""
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice TEXT,
    customer TEXT,
    plant_id INTEGER,
    date TEXT,
    amount REAL,
    created_at TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
)
""")


conn.commit()
conn.close()
