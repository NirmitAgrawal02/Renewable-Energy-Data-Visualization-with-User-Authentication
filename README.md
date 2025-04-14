# Renewable Energy Data Visualization with User Authentication

This project is a web-based application designed to visualize renewable energy data while incorporating user authentication for secure access. The application allows users to explore various datasets related to renewable energy sources, analyze trends, and gain insights into energy consumption and production.

## Features

- **User Authentication**: Secure login and registration system to protect user data.
- **Data Visualization**: Interactive charts and graphs to represent renewable energy data.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Customizable Views**: Filter and sort data based on user preferences.
- **Data Export**: Option to download visualized data in various formats.

## Technologies Used

- **Frontend**: Next.js
- **Backend**: Python & FastAPI
- **Database**: SQLite for data storage.
- **Authentication**: JSON Web Tokens (JWT) for secure user sessions.
- **Visualization**: Chart.js for creating interactive charts.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/NirmitAgrawal02/Renewable-Energy-Data-Visualization-with-User-Authentication.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Renewable-Energy-Data-Visualization-with-User-Authentication
    ```

### Backend Setup

1. Navigate to the `backend/app` directory:
    ```bash
    cd backend/app
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Run the backend server:
    ```bash
    python app.py
    ```
    The backend will be available at `http://127.0.0.1:8000`.

### Frontend Setup

1. Navigate to the `frontend` directory:
    ```bash
    cd ../../frontend
    ```
2. Install the required Node.js packages:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

## Usage

1. Register for an account or log in with existing credentials.
2. Browse and select datasets to visualize.
3. Customize the visualization settings as needed.
4. Export or save the visualized data for further analysis.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature-name"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Open-source libraries and frameworks used in the project.
- Inspiration from renewable energy initiatives worldwide.
- Support from the developer community.

## Contact

For questions or feedback, please contact [nirmit@myjobemails.com].
