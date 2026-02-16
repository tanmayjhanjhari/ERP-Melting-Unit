from flask import Flask, render_template, request, redirect, flash, jsonify, session
from flask_cors import CORS

import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.secret_key = "secret123"


# ======================================================
# DB CONNECTION + FINAL AUTO-MIGRATIONS
# ======================================================

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    
    # ---------- EMPLOYEES TABLE ----------
    conn.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_code TEXT,
        name TEXT,
        department TEXT,
        role TEXT,
        status TEXT,
        plant_id INTEGER,
        created_at TEXT
    )
""")
    
    # ---------- ATTENDANCE TABLE ----------
    conn.execute("""
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    date TEXT,
    status TEXT,
    created_at TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
)
""")
    
    
  # ---------- PAYROLL TABLE ----------
    conn.execute("""
CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER,
    month TEXT,
    year INTEGER,
    basic_salary REAL,
    deductions REAL,
    payable_days REAL,
    net_salary REAL,
    generated_at TEXT
)
""")

# ---------- PAYROLL MIGRATION (CRITICAL) ----------
    for column, sql in {
    "year": "ALTER TABLE payroll ADD COLUMN year INTEGER",
    "basic_salary": "ALTER TABLE payroll ADD COLUMN basic_salary REAL",
    "deductions": "ALTER TABLE payroll ADD COLUMN deductions REAL",
    "payable_days": "ALTER TABLE payroll ADD COLUMN payable_days REAL",
    "net_salary": "ALTER TABLE payroll ADD COLUMN net_salary REAL",
    "generated_at": "ALTER TABLE payroll ADD COLUMN generated_at TEXT",
    }.items():
        try:
            conn.execute(f"SELECT {column} FROM payroll LIMIT 1")
        except sqlite3.OperationalError:
            conn.execute(sql)







    # ---------- PLANTS TABLE ----------
    conn.execute("""
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_code TEXT,
            plant_name TEXT,
            location TEXT,
            status TEXT
        )
    """)
    
    
    # ---------- SALES TABLE ----------
    conn.execute("""
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT,
    customer_name TEXT,
    plant_id INTEGER,
    amount REAL,
    sale_date TEXT,
    created_at TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
)
""")

    # ---------- PURCHASE TABLE ----------
    conn.execute("""
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_name TEXT,
    plant_id INTEGER,
    amount REAL,
    purchase_date TEXT,
    created_at TEXT
)
""")
    
    
    # ---------- PROFIT / LOSS TABLE ----------
    conn.execute("""
CREATE TABLE IF NOT EXISTS profit_loss (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER,
    month TEXT,
    year INTEGER,
    sales REAL,
    purchases REAL,
    payroll REAL,
    net_profit REAL,
    generated_at TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
)
""")
    
    # ---------- PROFIT / LOSS MIGRATION ----------
    for column, sql in {
    "plant_id": "ALTER TABLE profit_loss ADD COLUMN plant_id INTEGER",
    "month": "ALTER TABLE profit_loss ADD COLUMN month TEXT",
    "year": "ALTER TABLE profit_loss ADD COLUMN year INTEGER",
    "sales": "ALTER TABLE profit_loss ADD COLUMN sales REAL",
    "purchases": "ALTER TABLE profit_loss ADD COLUMN purchases REAL",
    "payroll": "ALTER TABLE profit_loss ADD COLUMN payroll REAL",
    "net_profit": "ALTER TABLE profit_loss ADD COLUMN net_profit REAL",
    "generated_at": "ALTER TABLE profit_loss ADD COLUMN generated_at TEXT",
    }.items():
        try:
            conn.execute(f"SELECT {column} FROM profit_loss LIMIT 1")
        except sqlite3.OperationalError:
            conn.execute(sql)




    # ---------- DEFAULT PLANT ----------
    plant = conn.execute(
        "SELECT id FROM plants WHERE plant_name = 'Main Plant'"
    ).fetchone()

    if not plant:
        conn.execute(
            """
            INSERT INTO plants (plant_code, plant_name, location, status)
            VALUES (?, ?, ?, ?)
            """,
            ("PLANT-01", "Main Plant", "Head Office", "active")
        )
        conn.commit()

    plant_id = conn.execute(
        "SELECT id FROM plants WHERE plant_name = 'Main Plant'"
    ).fetchone()["id"]

    # ---------- INVENTORY MIGRATION ----------
    for column, sql in {
        "min_level": "ALTER TABLE inventory ADD COLUMN min_level REAL DEFAULT 0",
        "plant_id": "ALTER TABLE inventory ADD COLUMN plant_id INTEGER",
        "item_code": "ALTER TABLE inventory ADD COLUMN item_code TEXT"
    }.items():
        try:
            conn.execute(f"SELECT {column} FROM inventory LIMIT 1")
        except sqlite3.OperationalError:
            conn.execute(sql)
            conn.execute("UPDATE inventory SET plant_id = ?", (plant_id,))

    # ---------- BATCHES MIGRATION ----------
    for column, sql in {
        "status": "ALTER TABLE batches ADD COLUMN status TEXT DEFAULT 'completed'",
        "batch_date": "ALTER TABLE batches ADD COLUMN batch_date TEXT",
        "shift": "ALTER TABLE batches ADD COLUMN shift TEXT",
        "created_at": "ALTER TABLE batches ADD COLUMN created_at TEXT",
        "plant_id": "ALTER TABLE batches ADD COLUMN plant_id INTEGER",
        "batch_code": "ALTER TABLE batches ADD COLUMN batch_code TEXT"
    }.items():
        try:
            conn.execute(f"SELECT {column} FROM batches LIMIT 1")
        except sqlite3.OperationalError:
            conn.execute(sql)

    conn.execute(
        "UPDATE batches SET plant_id = ? WHERE plant_id IS NULL",
        (plant_id,)
    )

    conn.commit()
    return conn


# ======================================================
# SIMPLE LOGIN (FIXED MANAGER)
# ======================================================

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    if (
        data.get("email") == "manager@company.com"
        and data.get("password") == "manager123"
    ):
        session["logged_in"] = True
        return jsonify({"success": True})
    return jsonify({"success": False}), 401


@app.route('/api/logout')
def api_logout():
    session.clear()
    return jsonify({"success": True})


# ======================================================
# BASIC ROUTE
# ======================================================

@app.route('/')
def home():
    return "Aluminium Plant System is running"


# ======================================================
# INVENTORY
# ======================================================

@app.route('/inventory', methods=['GET', 'POST'])
def inventory():
    conn = get_db_connection()

    if request.method == 'POST':
        item_name = request.form['item_name']
        category = request.form['category']
        quantity = request.form['quantity']
        cost = request.form['cost']
        min_level = request.form['min_level']

        count = conn.execute(
            "SELECT COUNT(*) FROM inventory"
        ).fetchone()[0]
        item_code = f"ITEM-{count+1:03d}"

        conn.execute(
            """
            INSERT INTO inventory
            (item_name, category, quantity, cost_per_unit, min_level, plant_id, item_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (item_name, category, quantity, cost, min_level, 1, item_code)
        )
        conn.commit()
        conn.close()
        return redirect('/inventory')

    items = conn.execute(
        "SELECT *, quantity < min_level AS low_stock FROM inventory"
    ).fetchall()
    conn.close()

    return render_template('inventory.html', items=items)


# ======================================================
# BATCH
# ======================================================

@app.route('/batch', methods=['GET', 'POST'])
def batch():
    conn = get_db_connection()

    if request.method == 'POST':
        batch_name = request.form['batch_name']
        batch_date = request.form['batch_date']
        shift = request.form['shift']

        inventory_items = conn.execute("SELECT * FROM inventory").fetchall()
        materials = []
        total_cost = 0

        for item in inventory_items:
            qty_str = request.form.get(f"material_{item['id']}")
            if not qty_str:
                continue

            used_qty = float(qty_str)
            if used_qty <= 0:
                continue
            if used_qty > item['quantity']:
                flash("Not enough inventory", "error")
                return redirect('/batch')

            cost = used_qty * item['cost_per_unit']
            total_cost += cost
            materials.append((item, used_qty, cost))

        if not materials:
            flash("Batch must contain at least one material", "error")
            return redirect('/batch')

        today = datetime.now().strftime("%Y%m%d")
        batch_code = f"BATCH-{today}-{shift}-{int(datetime.now().timestamp())}"

        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO batches
            (batch_name, material_cost, batch_date, shift, status, created_at, plant_id, batch_code)
            VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)
            """,
            (batch_name, total_cost, batch_date, shift, "completed", 1, batch_code)
        )
        batch_id = cursor.lastrowid

        for item, used_qty, cost in materials:
            conn.execute(
                "UPDATE inventory SET quantity = quantity - ? WHERE id = ?",
                (used_qty, item['id'])
            )
            conn.execute(
                """
                INSERT INTO batch_materials
                (batch_id, item_id, quantity_used, cost)
                VALUES (?, ?, ?, ?)
                """,
                (batch_id, item['id'], used_qty, cost)
            )

        conn.commit()
        conn.close()
        return redirect('/batch')

    inventory = conn.execute("SELECT * FROM inventory").fetchall()
    batches = conn.execute("SELECT * FROM batches").fetchall()
    conn.close()

    return render_template('batch.html', inventory=inventory, batches=batches)


# ======================================================
# BATCH DETAILS
# ======================================================

@app.route('/batch/<int:batch_id>')
def batch_details(batch_id):
    conn = get_db_connection()

    batch = conn.execute(
        "SELECT * FROM batches WHERE id = ?",
        (batch_id,)
    ).fetchone()

    materials = conn.execute(
        """
        SELECT inventory.item_name,
               batch_materials.quantity_used,
               batch_materials.cost
        FROM batch_materials
        JOIN inventory ON batch_materials.item_id = inventory.id
        WHERE batch_materials.batch_id = ?
        """,
        (batch_id,)
    ).fetchall()

    conn.close()

    return render_template(
        'batch_details.html',
        batch=batch,
        materials=materials
    )


# ======================================================
# CANCEL BATCH
# ======================================================

@app.route('/batch/cancel/<int:batch_id>')
def cancel_batch(batch_id):
    conn = get_db_connection()
    conn.execute(
        "UPDATE batches SET status = 'cancelled' WHERE id = ?",
        (batch_id,)
    )
    conn.commit()
    conn.close()
    return redirect('/batch')


# ======================================================
# REPORT
# ======================================================

@app.route('/report')
def report():
    conn = get_db_connection()

    batches = conn.execute(
        "SELECT * FROM batches WHERE status = 'completed'"
    ).fetchall()

    total_batches = len(batches)

    total_cost = conn.execute(
        "SELECT SUM(material_cost) FROM batches WHERE status = 'completed'"
    ).fetchone()[0] or 0

    conn.close()

    return render_template(
        'report.html',
        batches=batches,
        total_batches=total_batches,
        total_cost=total_cost
    )


# ======================================================
# APIs FOR REACT
# ======================================================

# ======================================================
# PLANTS / UNITS API
# ======================================================

@app.route('/api/plants', methods=['GET', 'POST'])
def api_plants():
    conn = get_db_connection()

    if request.method == 'POST':
        data = request.json

        conn.execute(
            """
            INSERT INTO plants (plant_code, plant_name, location, status)
            VALUES (?, ?, ?, ?)
            """,
            (
                data['plant_code'],
                data['plant_name'],
                data['location'],
                "active"
            )
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True})

    plants = conn.execute(
        "SELECT * FROM plants ORDER BY id ASC"
    ).fetchall()
    conn.close()

    return jsonify([dict(p) for p in plants])

@app.route('/api/plants/<int:plant_id>/deactivate', methods=['POST'])
def deactivate_plant(plant_id):
    conn = get_db_connection()
    conn.execute(
        "UPDATE plants SET status = 'inactive' WHERE id = ?",
        (plant_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route('/api/plants/<int:plant_id>/activate', methods=['POST'])
def activate_plant(plant_id):
    conn = get_db_connection()
    conn.execute(
        "UPDATE plants SET status = 'active' WHERE id = ?",
        (plant_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})



@app.route('/api/inventory')
def api_inventory():
    conn = get_db_connection()
    items = conn.execute(
        """
        SELECT inventory.*, plants.plant_name
        FROM inventory
        JOIN plants ON inventory.plant_id = plants.id
        """
    ).fetchall()
    conn.close()
    return jsonify([dict(i) for i in items])

@app.route("/api/inventory/add", methods=["POST"])
def add_inventory():
    data = request.json
    conn = get_db_connection()

    conn.execute(
        """
        INSERT INTO inventory
        (item_name, category, quantity, cost_per_unit, min_level, plant_id)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data["item_name"],
            data["category"],
            data["quantity"],
            data["cost_per_unit"],
            data.get("min_level", 0),
            1,
        )
    )

    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/inventory/<int:item_id>/refill", methods=["POST"])
def refill_inventory(item_id):
    data = request.json
    conn = get_db_connection()

    if data.get("cost_per_unit"):
        conn.execute(
            """
            UPDATE inventory
            SET quantity = quantity + ?,
                cost_per_unit = ?
            WHERE id = ?
            """,
            (data["quantity"], data["cost_per_unit"], item_id)
        )
    else:
        conn.execute(
            """
            UPDATE inventory
            SET quantity = quantity + ?
            WHERE id = ?
            """,
            (data["quantity"], item_id)
        )

    conn.commit()
    conn.close()
    return jsonify({"success": True})



@app.route('/api/batches')
def api_batches():
    conn = get_db_connection()
    batches = conn.execute(
        """
        SELECT batches.*, plants.plant_name
        FROM batches
        JOIN plants ON batches.plant_id = plants.id
        ORDER BY batches.id DESC
        """
    ).fetchall()
    conn.close()
    return jsonify([dict(b) for b in batches])

# ---------------- DASHBOARD API ----------------

@app.route('/api/dashboard')
def api_dashboard():
    conn = get_db_connection()

    inventory_count = conn.execute(
        "SELECT COUNT(*) FROM inventory"
    ).fetchone()[0]

    active_batches = conn.execute(
        "SELECT COUNT(*) FROM batches WHERE status = 'completed'"
    ).fetchone()[0]

    employee_count = conn.execute(
        "SELECT COUNT(*) FROM employees WHERE status = 'active'"
    ).fetchone()[0]

    low_stock = conn.execute(
        "SELECT COUNT(*) FROM inventory WHERE quantity < min_level"
    ).fetchone()[0]

    recent_batches = conn.execute(
        """
        SELECT batch_name, material_cost, batch_date, shift
        FROM batches
        ORDER BY id DESC
        LIMIT 5
        """
    ).fetchall()

    conn.close()

    return jsonify({
        "inventory_count": inventory_count,
        "active_batches": active_batches,
        "employee_count": employee_count,
        "low_stock": low_stock,
        "recent_batches": [dict(b) for b in recent_batches]
    })


@app.route('/api/batch/<int:batch_id>')
def api_batch_details(batch_id):
    conn = get_db_connection()

    batch = conn.execute(
        """
        SELECT batches.*, plants.plant_name
        FROM batches
        JOIN plants ON batches.plant_id = plants.id
        WHERE batches.id = ?
        """,
        (batch_id,)
    ).fetchone()

    if not batch:
        conn.close()
        return jsonify({"error": "Batch not found"}), 404

    materials = conn.execute(
        """
        SELECT inventory.item_name,
               batch_materials.quantity_used,
               batch_materials.cost
        FROM batch_materials
        JOIN inventory ON batch_materials.item_id = inventory.id
        WHERE batch_materials.batch_id = ?
        """,
        (batch_id,)
    ).fetchall()

    conn.close()

    return jsonify({
        "batch": dict(batch),
        "materials": [dict(m) for m in materials]
    })

# ======================================================
# HR - EMPLOYEES API
# ======================================================

@app.route('/api/hr/employees', methods=['GET', 'POST'])
def api_employees():
    conn = get_db_connection()

    if request.method == 'POST':
        data = request.json

        count = conn.execute(
            "SELECT COUNT(*) FROM employees"
        ).fetchone()[0]

        emp_code = f"EMP-{count+1:03d}"

        conn.execute(
            """
            INSERT INTO employees
            (emp_code, name, department, role, status, plant_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                emp_code,
                data['name'],
                data['department'],
                data['role'],
                "active",
                data['plant_id'] 
            )
        )
        conn.commit()

        return jsonify({"success": True})

    employees = conn.execute(
        """
        SELECT employees.*, plants.plant_name
        FROM employees
        JOIN plants ON employees.plant_id = plants.id
        ORDER BY employees.id ASC
        """
    ).fetchall()

    conn.close()
    return jsonify([dict(e) for e in employees])

import pandas as pd
import os

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/api/hr/employees/upload-excel', methods=['POST'])
def upload_employees_excel():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)

    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]

    for i, row in df.iterrows():
        emp_code = f"EMP-{count+1:03d}"
        count += 1

        conn.execute(
            """
            INSERT INTO employees
            (emp_code, name, department, role, status, plant_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                emp_code,
                row["name"],
                row["department"],
                row["role"],
                "active",
                1
            )
        )

    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route('/api/hr/employees/<int:emp_id>/deactivate', methods=['POST'])
def deactivate_employee(emp_id):
    conn = get_db_connection()
    conn.execute(
        "UPDATE employees SET status = 'inactive' WHERE id = ?",
        (emp_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route('/api/hr/employees/<int:emp_id>/activate', methods=['POST'])
def activate_employee(emp_id):
    conn = get_db_connection()
    conn.execute(
        "UPDATE employees SET status = 'active' WHERE id = ?",
        (emp_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/hr/employees/<int:emp_id>/change-plant', methods=['POST'])
def change_employee_plant(emp_id):
    data = request.json
    conn = get_db_connection()

    conn.execute(
        "UPDATE employees SET plant_id = ? WHERE id = ?",
        (data['plant_id'], emp_id)
    )

    conn.commit()
    conn.close()
    return jsonify({"success": True})

# ======================================================
# HR - ATTENDANCE API
# ======================================================

@app.route('/api/hr/attendance', methods=['GET', 'POST'])
def api_attendance():
    conn = get_db_connection()

    if request.method == 'POST':
        data = request.json

        conn.execute(
            """
            INSERT INTO attendance (employee_id, date, status, created_at)
            VALUES (?, ?, ?, datetime('now'))
            """,
            (
                data['employee_id'],
                data['date'],
                data['status']
            )
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True})

    records = conn.execute(
        """
        SELECT attendance.*, employees.name, employees.emp_code
        FROM attendance
        JOIN employees ON attendance.employee_id = employees.id
        ORDER BY attendance.date DESC
        """
    ).fetchall()

    conn.close()
    return jsonify([dict(r) for r in records])

@app.route('/api/hr/attendance/upload-excel', methods=['POST'])
def upload_attendance_excel():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)
    conn = get_db_connection()

    for _, row in df.iterrows():
        emp = conn.execute(
            "SELECT id FROM employees WHERE emp_code=?",
            (row["emp_code"],)
        ).fetchone()

        if not emp:
            continue  # skip invalid emp codes

        conn.execute(
            """
            INSERT INTO attendance (employee_id, date, status, created_at)
            VALUES (?, ?, ?, datetime('now'))
            """,
            (emp["id"], str(row["date"])[:10], row["status"])
        )

    conn.commit()
    conn.close()
    return jsonify({"success": True})



@app.route("/api/payroll", methods=["GET"])
def api_payroll():
    conn = get_db_connection()

    payroll = conn.execute(
        """
        SELECT 
            payroll.id,
            payroll.emp_id,
            payroll.month,
            payroll.year,
            payroll.basic_salary,
            payroll.deductions,
            payroll.payable_days,
            payroll.net_salary,
            employees.emp_code,
            employees.name,
            employees.plant_id
        FROM payroll
        JOIN employees ON payroll.emp_id = employees.id
        ORDER BY payroll.id ASC
        """
    ).fetchall()

    conn.close()
    return jsonify([dict(p) for p in payroll])



@app.route("/api/payroll/generate", methods=["POST"])
def generate_payroll():
    data = request.json

    emp_id = data["emp_id"]
    month = data["month"]        # "01"
    year = data["year"]          # 2026
    basic = float(data["basic_salary"])
    deductions = float(data["deductions"])

    conn = get_db_connection()

    # Prevent duplicate payroll
    existing = conn.execute(
        "SELECT id FROM payroll WHERE emp_id=? AND month=? AND year=?",
        (emp_id, month, year)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({"error": "Payroll already generated"}), 400

    # Fetch attendance (FIXED)
    records = conn.execute(
        """
        SELECT status FROM attendance
        WHERE employee_id = ?
        AND strftime('%m', date) = ?
        AND strftime('%Y', date) = ?
        """,
        (emp_id, month, str(year))
    ).fetchall()

    payable_days = 0
    for r in records:
        status = r["status"].lower()
        if status == "present":
            payable_days += 1
        elif status in ["half-day", "half day"]:
            payable_days += 0.5

    import calendar
    total_days = calendar.monthrange(year, int(month))[1]
    per_day = basic / total_days
    net_salary = max(0, (per_day * payable_days) - deductions)

    conn.execute(
        """
        INSERT INTO payroll
        (emp_id, month, year, basic_salary, deductions,
         payable_days, net_salary, generated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """,
        (emp_id, month, year, basic, deductions, payable_days, net_salary)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "payable_days": payable_days,
        "net_salary": round(net_salary, 2)
    })


# ======================================================
# ACCOUNTS - SALES API
# ======================================================

@app.route("/api/sales", methods=["GET", "POST"])
def api_sales():
    conn = get_db_connection()

    if request.method == "POST":
        data = request.json

        count = conn.execute(
            "SELECT COUNT(*) FROM sales"
        ).fetchone()[0]

        invoice_no = f"INV-{count+1:04d}"

        conn.execute(
            """
            INSERT INTO sales
            (invoice_no, customer_name, plant_id, amount, sale_date, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                invoice_no,
                data["customer_name"],
                data["plant_id"],
                data["amount"],
                data["sale_date"]
            )
        )

        conn.commit()
        conn.close()
        return jsonify({"success": True})

    sales = conn.execute(
        """
        SELECT sales.*, plants.plant_name
        FROM sales
        JOIN plants ON sales.plant_id = plants.id
        ORDER BY sales.id ASC
        """
    ).fetchall()

    conn.close()
    return jsonify([dict(s) for s in sales])

@app.route("/api/accounts/sales/upload-excel", methods=["POST"])
def upload_sales_excel():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)

    conn = get_db_connection()

    for _, row in df.iterrows():
        plant = conn.execute(
            "SELECT id FROM plants WHERE plant_name = ?",
            (row["plant"],)
        ).fetchone()

        if not plant:
            continue  # skip invalid plant

        date = pd.to_datetime(row["date"]).strftime("%Y-%m-%d")

        conn.execute(
            """
            INSERT INTO sales
            (invoice, customer, plant_id, date, amount, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                row["invoice"],
                row["customer"],
                plant["id"],
                date,
                float(row["amount"])
            )
        )

    conn.commit()
    conn.close()

    return jsonify({"success": True})



# ======================================================
# PURCHASE API
# ======================================================

@app.route("/api/purchase", methods=["GET", "POST"])
def api_purchase():
    conn = get_db_connection()

    if request.method == "POST":
        data = request.json

        conn.execute(
            """
            INSERT INTO purchases
            (vendor_name, plant_id, amount, purchase_date, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            """,
            (
                data["vendor_name"],
                data["plant_id"],
                data["amount"],
                data["purchase_date"],
            )
        )

        conn.commit()
        conn.close()
        return jsonify({"success": True})

    purchases = conn.execute(
        """
        SELECT 
            purchases.id,
            purchases.vendor_name,
            purchases.amount,
            purchases.purchase_date,
            plants.plant_name
        FROM purchases
        JOIN plants ON purchases.plant_id = plants.id
        ORDER BY purchases.id ASC
        """
    ).fetchall()

    conn.close()
    return jsonify([dict(p) for p in purchases])

# ======================================================
# PROFIT / LOSS API
# ======================================================

@app.route("/api/accounts/profit", methods=["POST"])
def api_profit():
    data = request.json
    plant_id = data["plant_id"]
    month = data["month"]   # "01"
    year = data["year"]     # 2026

    conn = get_db_connection()

    sales = conn.execute(
        """
        SELECT IFNULL(SUM(amount), 0)
        FROM sales
        WHERE plant_id=?
        AND strftime('%m', sale_date)=?
        AND strftime('%Y', sale_date)=?
        """,
        (plant_id, month, str(year))
    ).fetchone()[0]

    purchases = conn.execute(
        """
        SELECT IFNULL(SUM(amount), 0)
        FROM purchases
        WHERE plant_id=?
        AND strftime('%m', purchase_date)=?
        AND strftime('%Y', purchase_date)=?
        """,
        (plant_id, month, str(year))
    ).fetchone()[0]

    payroll = conn.execute(
        """
        SELECT IFNULL(SUM(net_salary), 0)
        FROM payroll
        JOIN employees ON payroll.emp_id = employees.id
        WHERE employees.plant_id=?
        AND payroll.month=?
        AND payroll.year=?
        """,
        (plant_id, month, year)
    ).fetchone()[0]

    conn.close()

    profit = sales - purchases - payroll

    return jsonify({
        "sales": sales,
        "purchases": purchases,
        "payroll": payroll,
        "profit": profit
    })
    
@app.route("/api/profit-loss/generate", methods=["POST"])
def generate_profit_loss():
    data = request.json
    plant_id = data["plant_id"]
    month = data["month"]   # "02"
    year = data["year"]     # 2026

    conn = get_db_connection()

    # ---- SALES ----
    sales = conn.execute(
        """
        SELECT SUM(amount) FROM sales
        WHERE plant_id=?
        AND strftime('%m', date)=?
        AND strftime('%Y', date)=?
        """,
        (plant_id, month, str(year))
    ).fetchone()[0] or 0

    # ---- PURCHASES ----
    purchases = conn.execute(
        """
        SELECT SUM(amount) FROM purchases
        WHERE plant_id=?
        AND strftime('%m', date)=?
        AND strftime('%Y', date)=?
        """,
        (plant_id, month, str(year))
    ).fetchone()[0] or 0

    # ---- PAYROLL ----
    payroll = conn.execute(
        """
        SELECT SUM(net_salary) FROM payroll
        WHERE emp_id IN (
            SELECT id FROM employees WHERE plant_id=?
        )
        AND month=? AND year=?
        """,
        (plant_id, month, year)
    ).fetchone()[0] or 0

    net_profit = sales - purchases - payroll

    # Remove old record if exists (so Generate works repeatedly)
    conn.execute(
        "DELETE FROM profit_loss WHERE plant_id=? AND month=? AND year=?",
        (plant_id, month, year)
    )

    conn.execute(
        """
        INSERT INTO profit_loss
        (plant_id, month, year, sales, purchases, payroll, net_profit, generated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """,
        (plant_id, month, year, sales, purchases, payroll, net_profit)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "sales": sales,
        "purchases": purchases,
        "payroll": payroll,
        "net_profit": net_profit
    })

@app.route("/api/profit-loss/trend")
def profit_loss_trend():
    plant_id = request.args.get("plant_id", 1)

    conn = get_db_connection()

    rows = conn.execute(
        """
        SELECT month, year, net_profit
        FROM profit_loss
        WHERE plant_id=?
        ORDER BY year, month
        """,
        (plant_id,)
    ).fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])






if __name__ == '__main__':
    app.run(debug=True)
