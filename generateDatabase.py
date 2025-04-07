import pandas as pd
import numpy as np
import sqlite3
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Define start and end dates
start_date = datetime(2024, 8, 1)
end_date = datetime(2025, 4, 5)

# Lists for mock data
energy_sources = ["Solar", "Wind", "Hydro", "Coal", "Natural Gas"]
weather_conditions = ["Sunny", "Cloudy", "Rainy", "Windy", "Snowy"]
type_mapping = {
    "Solar": "Renewable", "Wind": "Renewable", "Hydro": "Renewable",
    "Coal": "Non-Renewable", "Natural Gas": "Non-Renewable"
}

# Generate the dataset
data = []
current_date = start_date
while current_date <= end_date:
    for hour in range(24):
        hour_begin = f"{hour:02d}:00:00"
        hour_end = "24:00:00" if hour == 23 else f"{(hour + 1):02d}:00:00"

        if 6 <= hour <= 18:
            source = np.random.choice(energy_sources, p=[0.4, 0.2, 0.1, 0.15, 0.15])
        else:
            source = np.random.choice(energy_sources, p=[0.05, 0.3, 0.2, 0.25, 0.2])

        energy_type = type_mapping[source]

        month = current_date.month
        if month in [12, 1, 2]:
            weather = np.random.choice(weather_conditions, p=[0.1, 0.2, 0.3, 0.2, 0.2])
        else:
            weather = np.random.choice(weather_conditions, p=[0.3, 0.3, 0.2, 0.15, 0.05])

        consumption = np.random.uniform(50, 500) * (1.2 if 8 <= hour <= 20 else 0.8)

        # Adjusted generation to always be >= consumption
        if source == "Solar" and weather == "Sunny" and 6 <= hour <= 18:
            generation = np.random.uniform(consumption, consumption + 300)
        elif source == "Wind" and weather == "Windy":
            generation = np.random.uniform(consumption, consumption + 250)
        elif source == "Hydro":
            generation = np.random.uniform(consumption, consumption + 200)
        else:
            generation = np.random.uniform(consumption, consumption + 100)

        # Adjusted price range
        price = np.random.uniform(1, 70)

        # Revenue = price * consumption
        revenue = consumption * price

        data.append([
            current_date.strftime("%Y-%m-%d"), hour_begin, hour_end,
            source, energy_type, round(consumption, 2), round(generation, 2),
            weather, round(price, 2), round(revenue, 2)
        ])
    current_date += timedelta(days=1)

# Column names remain the same
columns = ["date", "hour_beginning", "hour_ending", "energy_source", "type",
           "consumption_mwh", "generation_mwh", "weather", "price_per_mwh", "revenue"]

df = pd.DataFrame(data, columns=columns)

# Create a connection to SQLite database
db_file = 'renewable.db'

with sqlite3.connect(db_file) as conn:
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS energy_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            hour_beginning TEXT,
            hour_ending TEXT,
            energy_source TEXT,
            type TEXT,
            consumption_mwh REAL,
            generation_mwh REAL,
            weather TEXT,
            price_per_mwh REAL,
            revenue REAL
        )
    ''')

    df.to_sql('energy_data', conn, if_exists='append', index=False)

    cursor.execute("SELECT COUNT(*) FROM energy_data")
    row_count = cursor.fetchone()[0]
    print(f"Total number of rows inserted: {row_count}")

    cursor.execute("SELECT * FROM energy_data LIMIT 5")
    rows = cursor.fetchall()
    print("Columns:", [description[0] for description in cursor.description])
    for row in rows:
        print(row)

print(f"✅ Dataset has been successfully appended to the 'energy_data' table in '{db_file}'.")
