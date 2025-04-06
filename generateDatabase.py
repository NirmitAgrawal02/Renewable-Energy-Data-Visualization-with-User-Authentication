import pandas as pd
import numpy as np
import sqlite3
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Define start and end dates
start_date = datetime(2024, 1, 1)
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
        # Use "24:00:00" for the last hour instead of "00:00:00" of the next day
        if hour == 23:
            hour_end = "24:00:00"
        else:
            hour_end = f"{(hour + 1):02d}:00:00"

        # Mock data generation
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

        if source == "Solar" and weather == "Sunny" and 6 <= hour <= 18:
            generation = np.random.uniform(300, 600)
        elif source == "Wind" and weather == "Windy":
            generation = np.random.uniform(200, 500)
        elif source == "Hydro":
            generation = np.random.uniform(100, 400)
        else:
            generation = np.random.uniform(40, 300)

        price = np.random.uniform(20, 150) * (1.3 if consumption > generation else 0.9)
        revenue = generation * price

        data.append([
            current_date.strftime("%Y-%m-%d"), hour_begin, hour_end,
            source, energy_type, round(consumption, 2), round(generation, 2),
            weather, round(price, 2), round(revenue, 2)
        ])
    current_date += timedelta(days=1)

# Create DataFrame
columns = ["Date", "Hour Beginning", "Hour Ending", "Energy Source", "Type",
           "Consumption (MWh)", "Generation (MWh)", "Weather", "Price ($/MWh)", "Revenue ($)"]
df = pd.DataFrame(data, columns=columns)

# Create a connection to SQLite database
db_file = 'energy_database.db'
conn = sqlite3.connect(db_file)

# Export the DataFrame directly to SQLite
df.to_sql('energy_data', conn, if_exists='replace', index=False)

# Verify the data was inserted (optional)
cursor = conn.cursor()
cursor.execute("SELECT * FROM energy_data LIMIT 5")
rows = cursor.fetchall()

# Print column names and the first 5 rows for verification
print("Columns:", [description[0] for description in cursor.description])
for row in rows:
    print(row)

# Close the connection
conn.close()

print(f"Dataset has been successfully stored in '{db_file}' in the 'energy_data' table.")